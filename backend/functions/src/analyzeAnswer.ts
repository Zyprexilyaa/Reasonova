import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AnalyzeAnswerRequest,
  AnalyzeAnswerResponse,
  GeminiAnalysisResult,
  RubricBasedGeminiResult,
} from './types';
import { saveAnalysisResult, saveStudentAnswer, saveAnswerWithCriteria } from './database';
import { transcribeAudioFile } from './transcribeAudio';

// Initialize Gemini AI
const clientApiKey = process.env.GOOGLE_API_KEY;
console.log('=== GEMINI API DEBUG ===');
console.log('API Key exists:', !!clientApiKey);
console.log('API Key starts with:', clientApiKey ? clientApiKey.substring(0, 10) + '...' : 'NONE');
console.log('API Key length:', clientApiKey?.length || 0);
console.log('========================');

if (!clientApiKey) {
  console.warn('GOOGLE_API_KEY not set - will use mock analysis fallback');
}

// Service account access token cache
let _saAccessToken: { token: string; expiry: number } | null = null;

async function getServiceAccountAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (_saAccessToken && Date.now() < _saAccessToken.expiry - 60000) {
    return _saAccessToken.token;
  }

  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!saJson) {
    throw new Error('Service account JSON not available in FIREBASE_SERVICE_ACCOUNT');
  }

  let sa: any;
  try {
    sa = typeof saJson === 'string' ? JSON.parse(saJson) : saJson;
  } catch (err) {
    throw new Error('Failed to parse service account JSON: ' + String(err));
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const scope = 'https://www.googleapis.com/auth/cloud-platform';
  const claimSet = {
    iss: sa.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  function base64url(input: string) {
    return Buffer.from(input)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  const unsignedJwt = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  const signature = signer.sign(sa.private_key, 'base64');
  const signedJwt = `${unsignedJwt}.${signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;

  // Exchange JWT for access token
  const tokenRes = await axios.post('https://oauth2.googleapis.com/token', `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(signedJwt)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10000,
  });

  const accessToken = tokenRes.data?.access_token;
  const expiresIn = tokenRes.data?.expires_in || 3600;
  if (!accessToken) {
    throw new Error('Failed to obtain access token from service account');
  }

  _saAccessToken = { token: accessToken, expiry: Date.now() + expiresIn * 1000 };
  return accessToken;
}

/**
 * Sleep utility for retry delays
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type OfficialScoringData = {
  code: string;
  question: string;
  rubric: string;
  passage: string;
  unitId: string;
};

function normalizeQuestionKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function loadOfficialScoringData(questionId: string): OfficialScoringData | null {
  try {
    const repoRoot = path.resolve(process.cwd(), '..', '..');
    const specPath = path.join(repoRoot, 'PISA_Reading_Mock_Example', 'How to scoring', 'grading_spec.json');
    const passagesPath = path.join(repoRoot, 'PISA_Reading_Mock_Example', 'How to scoring', 'passages.json');

    const gradingSpec = JSON.parse(fs.readFileSync(specPath, 'utf8')) as Array<{
      code?: string;
      question?: string;
      rubric?: string;
      unit_id?: string;
      passage_unit?: string;
    }>;
    const passages = JSON.parse(fs.readFileSync(passagesPath, 'utf8')) as Array<{
      unit_id?: string;
      passage?: string;
    }>;

    const normalizedQuestionId = normalizeQuestionKey(questionId);
    const match = gradingSpec.find((entry) => {
      if (!entry.code) {
        return false;
      }
      return normalizeQuestionKey(entry.code) === normalizedQuestionId;
    });

    if (!match || !match.rubric) {
      return null;
    }

    const passageMatch = passages.find((entry) => entry.unit_id === match.passage_unit || entry.unit_id === match.unit_id);
    return {
      code: match.code || questionId,
      question: match.question || `Question ID: ${questionId}`,
      rubric: match.rubric,
      passage: passageMatch?.passage || '',
      unitId: match.unit_id || match.passage_unit || 'unknown',
    };
  } catch (error) {
    console.warn('⚠️ Could not load official scoring criteria from the scoring folder:', error);
    return null;
  }
}

export function buildScoringPrompt(
  req: Pick<AnalyzeAnswerRequest, 'transcription' | 'questionId' | 'referenceAnswer' | 'scoringGuideline'>,
  officialScoringData?: OfficialScoringData | null
): string {
  const resolvedScoringData = officialScoringData ?? loadOfficialScoringData(req.questionId);
  const passage = resolvedScoringData?.passage || 'No passage available.';
  const question = resolvedScoringData?.question || `Question ID: ${req.questionId}`;
  const rubric = resolvedScoringData?.rubric || req.scoringGuideline || 'Use the rubric provided by the teacher.';

  return `คุณเป็นผู้ตรวจข้อสอบ PISA การอ่าน ประเภทข้อเขียนตอบอิสระ (constructed response)

หน้าที่ของคุณ:
1. อ่านบทอ่าน (passage) และคำถาม (question) เพื่อเข้าใจบริบท
2. เทียบคำตอบของนักเรียน (student_answer) กับเกณฑ์การให้คะแนนอย่างเป็นทางการ (rubric)
3. ให้คะแนนตามเกณฑ์เท่านั้น — ห้ามใช้ดุลยพินิจส่วนตัวนอกเหนือจากที่ rubric ระบุ
4. ถ้าคำตอบเข้าข่ายหลายระดับ (เช่น ทั้ง "ได้คะแนนเต็ม" และ "ได้คะแนนบางส่วน") ให้เลือกระดับสูงสุดที่คำตอบเข้าเกณฑ์จริง
5. ถ้าคำตอบสั้นเกินไป คลุมเครือ หรือไม่เกี่ยวข้อง ให้คะแนน 0 ตามหมวด "ไม่ได้คะแนน"

ตอบกลับเป็น JSON เท่านั้น ตามรูปแบบนี้:
{
  "score": <number>,
  "max_score": <number>,
  "level": "เต็ม | บางส่วน | ไม่ได้คะแนน",
  "matched_criterion": "<ยกข้อความสั้นๆ จาก rubric ที่ใช้ตัดสิน>",
  "feedback_th": "<feedback สั้นๆ ให้นักเรียน เป็นภาษาไทย เชิงสร้างสรรค์>"
}

บทอ่าน:
"""
${passage}
"""

คำถาม: ${question}

เกณฑ์การให้คะแนน:
"""
${rubric}
"""

คำตอบของนักเรียน:
"""
${req.transcription}
"""`;
}

/**
 * Call Gemini API via REST API (v1beta) instead of SDK
 * Includes automatic retry logic for temporary failures (503, 429)
 */
async function callGeminiViaREST(prompt: string, retryCount: number = 0): Promise<string> {
  // This function will attempt to authenticate using, in order:
  // 1) a provided API key (GOOGLE_API_KEY starting with 'AIza'),
  // 2) an OAuth token provided in GOOGLE_API_KEY (starts with 'AQ' or 'ya29'),
  // 3) a service account JSON provided in FIREBASE_SERVICE_ACCOUNT (mint a token).

  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    if (retryCount === 0) {
      console.log('📊 Calling Gemini API via v1beta REST endpoint...');
    } else {
      console.log(`📊 Retrying Gemini API (attempt ${retryCount + 1}/4)...`);
    }

    // Support both traditional API keys (AIza...) and OAuth access tokens (AQ..., ya29...)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let url = baseUrl;
    if (clientApiKey && clientApiKey.startsWith && clientApiKey.startsWith('AIza')) {
      // API key usage via query param
      url = `${baseUrl}?key=${clientApiKey}`;
    } else if (clientApiKey && clientApiKey.startsWith && (clientApiKey.startsWith('AQ') || clientApiKey.startsWith('ya29'))) {
      // OAuth access token - use Bearer auth
      headers['Authorization'] = `Bearer ${clientApiKey}`;
    } else if (!clientApiKey) {
      // No API key/token provided — try service account flow
      try {
        const saToken = await getServiceAccountAccessToken();
        headers['Authorization'] = `Bearer ${saToken}`;
      } catch (err) {
        console.warn('⚠️ Service account token acquisition failed:', err instanceof Error ? err.message : String(err));
        // leave url as baseUrl and proceed; request will likely fail and be handled
      }
    } else {
      // Fallback to query param if unknown format
      url = `${baseUrl}?key=${clientApiKey}`;
    }

    const response = await axios.post(url, payload, {
      headers,
      timeout: 30000 // 30s timeout
    });

    console.log('📊 API Response status:', response.status);
    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates in response');
    }

    const content = candidates[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('No text content in response');
    }

    console.log('✅ Got response from Gemini API (', content.length, 'chars )');
    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const isRetryable = status === 503 || status === 429; // Service Unavailable or Too Many Requests
      const maxRetries = 3;

      if (isRetryable && retryCount < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount) * 1000;
        console.warn(`⚠️ API returned ${status}, retrying after ${delayMs}ms...`);
        await sleep(delayMs);
        return callGeminiViaREST(prompt, retryCount + 1);
      }

      console.error('❌ Axios error:', status, error.response?.data);
      throw new Error(`API Error ${status}: ${JSON.stringify(error.response?.data)}`);
    }
    throw error;
  }
}

/**
 * Analyze student answer using Google Gemini AI
 * Evaluates thinking level, provides feedback, and suggests improvements
 */
export async function analyzeStudentAnswer(
  req: AnalyzeAnswerRequest
): Promise<AnalyzeAnswerResponse> {
  try {
    const {
      transcription,
      questionId,
      referenceAnswer,
      scoringGuideline,
      studentId,
      audioBase64,
    } = req;

    const officialScoringData = loadOfficialScoringData(questionId);

    // Create the analysis prompt for Gemini
    const analysisPrompt = buildScoringPrompt(req, officialScoringData);

    // Proceed to call Gemini API — authentication may come from API key, OAuth token, or service account

    // Try Gemini API first (via v1beta REST API)
    try {
      console.log('📊 CALLING GEMINI API (v1beta) with prompt length:', analysisPrompt.length);
      const analysisText = await callGeminiViaREST(analysisPrompt);

      console.log('📊 Gemini API response received');
      console.log('📝 Raw response (first 300 chars):', analysisText.substring(0, 300));
      console.log('📝 Response length:', analysisText.length);

      // Remove markdown code blocks if present (Gemini sometimes wraps in ```json...```)
      let cleanedText = analysisText
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      console.log('📝 After cleanup (first 300 chars):', cleanedText.substring(0, 300));

      // Parse the JSON response
      let analysisResult: GeminiAnalysisResult | RubricBasedGeminiResult;
      try {
        analysisResult = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Failed to parse:', cleanedText.substring(0, 500));
        throw parseError;
      }

      // Detect which format we received
      const isRubricBased = 'matched_criterion' in analysisResult;
      
      if (isRubricBased) {
        console.log('📊 Received rubric-based scoring format');
        const rubricResult = analysisResult as RubricBasedGeminiResult;
        
        // Map rubric-based format to legacy format for compatibility
        const mappedResponse: AnalyzeAnswerResponse = {
          id: `analysis-${Date.now()}`,
          studentAnswerId: `answer-${Date.now()}`,
          studentId: req.studentId,
          questionId: req.questionId,
          transcription: req.transcription,
          thinkingLevel: rubricResult.score >= (rubricResult.max_score || 100) * 0.8 ? 4 : rubricResult.score >= (rubricResult.max_score || 100) * 0.5 ? 2 : 1,
          score: rubricResult.score,
          feedback: rubricResult.feedback_th || rubricResult.feedback_en || rubricResult.matched_criterion,
          suggestedAnswer: req.referenceAnswer,
          strengths: rubricResult.matched_criterion ? [rubricResult.matched_criterion] : [],
          improvements: [],
          analysisTimestamp: new Date().toISOString(),
        };

        // Save to Firestore in background
        console.log('💾 Saving rubric-based analysis to Firestore (background)...');
        saveAnalysisResult(mappedResponse).catch((error) => {
          console.warn('⚠️ Warning: Failed to save to Firestore:', error);
        });

        if (req.proposition) {
          saveAnswerWithCriteria(
            req.studentId,
            req.proposition,
            req.transcription,
            JSON.stringify(rubricResult),
            rubricResult.score
          ).catch((error) => {
            console.warn('⚠️ Warning: Failed to save answer with criteria:', error);
          });
        }

        return mappedResponse;
      }

      // Handle legacy Bloom's taxonomy format
      console.log('📊 Received legacy Bloom\'s taxonomy format');
      const legacyResult = analysisResult as GeminiAnalysisResult;
      console.log('✅ Analysis result - Level:', legacyResult.thinkingLevel, 'Score:', legacyResult.score);

      // Validate the response
      if (
        !legacyResult.thinkingLevel ||
        legacyResult.score === undefined ||
        !legacyResult.feedback ||
        !legacyResult.suggestedAnswer
      ) {
        console.warn('⚠️ Invalid analysis result structure from Gemini, using fallback');
        throw new Error('Invalid analysis result from Gemini');
      }

      console.log('✅ Gemini analysis successful - Level:', legacyResult.thinkingLevel, 'Score:', legacyResult.score);

      // Build response immediately (don't wait for Firestore saves)
      const responseData = {
        id: `analysis-${Date.now()}`,
        studentAnswerId: `answer-${Date.now()}`,
        studentId: req.studentId,
        questionId: req.questionId,
        transcription: req.transcription,
        thinkingLevel: legacyResult.thinkingLevel,
        score: legacyResult.score,
        feedback: legacyResult.feedback,
        suggestedAnswer: legacyResult.suggestedAnswer,
        strengths: legacyResult.strengths || [],
        improvements: legacyResult.improvements || [],
        analysisTimestamp: new Date().toISOString(),
      };

      // Save to Firestore in background (don't wait)
      console.log('💾 Saving to Firestore (background)...');
      saveAnalysisResult({
        ...responseData,
        studentAnswerId: `answer-${Date.now()}`,
      }).catch((error) => {
        console.warn('⚠️ Warning: Failed to save to Firestore:', error);
      });

      // If proposition data provided, save with criteria
      if (req.proposition) {
        console.log('💾 Saving answer with proposition criteria (background)...');
        saveAnswerWithCriteria(
          req.studentId,
          req.proposition,
          req.transcription,
          JSON.stringify(analysisResult),
          analysisResult.score
        ).catch((error) => {
          console.warn('⚠️ Warning: Failed to save answer with criteria:', error);
        });
      }

      return responseData;
    } catch (geminiError) {
      console.error('❌❌❌ GEMINI API FAILED ❌❌❌');
      console.error('Error type:', geminiError?.constructor?.name);
      console.error('Error message:', geminiError instanceof Error ? geminiError.message : String(geminiError));
      console.error('Full error:', JSON.stringify(geminiError, null, 2));
      console.error('Stack:', geminiError instanceof Error ? geminiError.stack : 'N/A');
      
      console.warn('🔄 Falling back to mock analysis');
      return await generateMockAnalysis(req);
    }
  } catch (error) {
    console.error('🔴 FATAL ERROR in analyzeStudentAnswer:');
    console.error('Error:', error);
    throw new Error(
      `Failed to analyze answer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate a sample analysis for testing
 * Use this when Gemini API is not available
 */
export async function generateMockAnalysis(
  req: AnalyzeAnswerRequest
): Promise<AnalyzeAnswerResponse> {
  const studentAnswerId = `mock-${Date.now()}`;
  const resultId = `result-${Date.now()}`;

  return {
    id: resultId,
    studentAnswerId,
    studentId: req.studentId,
    questionId: req.questionId,
    transcription: req.transcription,
    thinkingLevel: 2,
    score: 65,
    feedback:
      'Your answer shows some understanding of the topic but could be more detailed. Try to include more specific examples and explanations of how concepts relate to each other.',
    suggestedAnswer:
      req.referenceAnswer,
    strengths: [
      'You identified the main concept correctly',
      'Your explanation was clear and easy to follow',
    ],
    improvements: [
      'Add more supporting evidence and examples',
      'Explain the reasoning behind your answer more thoroughly',
      'Connect your answer to broader concepts or real-world applications',
    ],
    analysisTimestamp: new Date().toISOString(),
  };
}
