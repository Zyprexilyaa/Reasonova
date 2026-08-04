import React, { useState, useEffect } from 'react';
import { Question, AnalysisResult } from '../types';
import { AudioRecorder } from '../components/AudioRecorder';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { SpeechToTextPanel } from '../components/SpeechToTextPanel';
import { cleanupAudioUrl } from '../services/storage';
import { analyzeStudentAnswer, transcribeAudio } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { ExamQuestionData } from '../services/examQuestionService';

interface QuestionPageProps {
  question: Question;
  studentId: string;
  proposition?: ExamQuestionData; // NEW: Optional exam question with criteria
  onAnalysisComplete?: (result: AnalysisResult) => void; // NEW: Callback for analysis
}

type InputMethod = 'voice' | 'text';

export const QuestionPage: React.FC<QuestionPageProps> = ({
  question,
  studentId,
  proposition, // NEW: destructure proposition
  onAnalysisComplete, // NEW: destructure callback
}) => {
  const { t, language } = useLanguage();
  const [inputMethod, setInputMethod] = useState<InputMethod>('voice');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [supportText, setSupportText] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecordingComplete = (blob: Blob, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setError(null);
  };

  useEffect(() => {
    const answerFileUrl = proposition?.answerFileUrl;
    if (!answerFileUrl) {
      setSupportText('');
      return;
    }

    const loadSupportText = async () => {
      try {
        const response = await fetch(answerFileUrl);
        if (!response.ok) {
          setSupportText('');
          return;
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          setSupportText('');
          return;
        }

        const text = await response.text();
        const isHtml = /<\s*html.*?>/i.test(text);
        if (!text || isHtml) {
          setSupportText('');
          return;
        }

        setSupportText(text);
      } catch {
        setSupportText('');
      }
    };

    loadSupportText();
  }, [proposition?.answerFileUrl]);

  const hasChoiceOptions = proposition?.questionType === 'choice' && (proposition.options?.length ?? 0) > 0;
  const hasAnswerInput = hasChoiceOptions
    ? Boolean(selectedChoice)
    : inputMethod === 'voice'
      ? Boolean(audioBlob)
      : Boolean(textAnswer.trim());

  const handleSubmitAnswer = async () => {
    // Get transcription based on input method
    let finalTranscription = '';

    if (proposition?.questionType === 'choice') {
      if (!selectedChoice) {
        setError('Please select an answer option.');
        return;
      }
      finalTranscription = selectedChoice;
    } else if (inputMethod === 'voice') {
      if (!audioBlob || !audioUrl) {
        setError(t('pleaseRecordAnswer'));
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        finalTranscription = await transcribeAudio(audioBlob);
        setTranscription(finalTranscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription error');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!textAnswer.trim()) {
        setError(t('pleaseRecordAnswer'));
        return;
      }
      finalTranscription = textAnswer;
    }

    try {
      setIsAnalyzing(true);
      const result = await analyzeStudentAnswer({
        transcription: finalTranscription,
        questionId: question.id,
        referenceAnswer: question.referenceAnswer,
        scoringGuideline: question.scoringGuideline,
        studentId,
        audioBase64: '',
        proposition, // NEW: pass proposition with criteria
        language: language as 'th' | 'en', // NEW: pass language
      }, audioBlob || undefined);

      setAnalysisResult(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      
      // Provide better error messages for common issues
      if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
        setError('🔄 API Busy: The AI service is experiencing high demand. The system will automatically retry (up to 3 times). Please wait...');
      } else if (errorMessage.includes('429')) {
        setError('⏳ Too many requests. Please wait a moment and try again.');
      } else {
        setError(errorMessage);
      }

    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        cleanupAudioUrl(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="question-page">
      <div className="question-container">
        {/* Question Display */}
        <div className="question-section">
          <h1>{t('question')}</h1>
          <div className="question-content">
            {question.questionImage && (
              <img
                src={question.questionImage}
                alt="Question"
                className="question-image"
              />
            )}
            {proposition?.questionType !== 'pdf' && (
              <p className="question-text">{question.questionText}</p>
            )}

            {proposition?.questionType === 'choice' ? (
              proposition.options?.length ? (
                <div className="question-context" style={{ marginBottom: 16 }}>
                  <strong>Choose one answer:</strong>
                  <div className="choice-grid">
                    {proposition.options.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedChoice(option)}
                        className={`choice-option ${selectedChoice === option ? 'active' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="question-context" style={{ marginBottom: 16 }}>
                  <strong>This question is multiple choice.</strong>
                  <p style={{ marginTop: 8 }}>
                    The choice options are not currently available for this question. You can still type your answer below, or choose another question.
                  </p>
                </div>
              )
            ) : null}

            {((proposition?.sourceType === 'pdf' || proposition?.pdfUrl) && (proposition?.pdfSliceUrl || proposition?.pdfUrl)) ? (
              <>
                <div className="question-context" style={{ backgroundColor: '#fff4e5', borderColor: '#f59e0b' }}>
                  <strong>PDF Question</strong>
                  <p style={{ marginTop: 8 }}>
                    The full question is shown in the embedded PDF below. Please read the PDF page carefully and answer based on that content.
                  </p>
                </div>
                <div className="question-context">
                  <strong>PDF Viewer</strong>
                  <div style={{ marginTop: 8, minHeight: 760, border: '1px solid #d1d5db' }}>
                    <object
                      data={proposition.pdfSliceUrl || proposition.pdfUrl}
                      type="application/pdf"
                      width="100%"
                      height="760"
                      aria-label="PDF Viewer"
                    >
                      <p style={{ padding: 16, color: '#333' }}>
                        Your browser does not support inline PDFs. You can{' '}
                        <a href={proposition.pdfSliceUrl || proposition.pdfUrl} target="_blank" rel="noreferrer">
                          open the PDF in a new tab
                        </a>.
                      </p>
                    </object>
                  </div>
                  {proposition.sourcePageRange ? (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                      Showing page{proposition.sourcePageRange.includes('-') ? 's' : ''}: {proposition.sourcePageRange}
                    </p>
                  ) : proposition.sourcePage ? (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                      Showing page: {proposition.sourcePage}
                    </p>
                  ) : proposition.pdfFileName ? (
                    <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                      Source PDF: {proposition.pdfFileName}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {supportText && (
              <div className="question-context" style={{ marginTop: 16 }}>
                <strong>Answer guidance</strong>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: 8 }}>{supportText}</pre>
              </div>
            )}

            {question.context && (
              <div className="question-context">
                <strong>Context:</strong>
                <p>{question.context}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recording Section */}
        {!analysisResult && (
          <div className="recording-section">
            <h2>{t('recordAnswer')}</h2>
            <p className="instructions">{t('instructions')}</p>

            {proposition?.questionType === 'choice' && hasChoiceOptions ? (
              <div className="question-context" style={{ marginBottom: '1.5rem' }}>
                <strong>Select one answer option and submit.</strong>
                <p style={{ marginTop: 8, color: '#444' }}>
                  Once you choose an option, press submit to receive analysis and feedback.
                </p>
              </div>
            ) : proposition?.questionType === 'choice' && !hasChoiceOptions ? (
              <div className="question-context" style={{ marginBottom: '1.5rem' }}>
                <strong>Choice question without options</strong>
                <p style={{ marginTop: 8, color: '#444' }}>
                  If this question has answer choices, they are not loaded yet. Please type your best answer, or select another question.
                </p>
              </div>
            ) : (
              <>
                {/* Input Method Selection */}
                <div className="input-method-selector">
                  <label>{t('selectInputMethod')}:</label>
                  <div className="method-buttons">
                    <button
                      className={`method-btn ${inputMethod === 'voice' ? 'active' : ''}`}
                      onClick={() => setInputMethod('voice')}
                    >
                      🎤 {t('voiceRecording')}
                    </button>
                    <button
                      className={`method-btn ${inputMethod === 'text' ? 'active' : ''}`}
                      onClick={() => setInputMethod('text')}
                    >
                      ⌨️ {t('typingAnswer')}
                    </button>
                  </div>
                </div>

                {/* Voice Recording */}
                {inputMethod === 'voice' && (
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isSubmitting || isAnalyzing}
                  />
                )}

                {/* Text Input */}
                {inputMethod === 'text' && (
                  <>
                    <textarea
                      className="text-input"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder={t('typeYourAnswer')}
                      disabled={isSubmitting || isAnalyzing}
                      rows={6}
                    />
                    <SpeechToTextPanel
                      value={textAnswer}
                      onChange={setTextAnswer}
                      placeholder={t('typeYourAnswer')}
                      lang="th-TH,en-US"
                      label="Speech to text"
                    />
                  </>
                )}
              </>
            )}

            {error && <div className="error-alert">{error}</div>}

            <button
              onClick={handleSubmitAnswer}
              disabled={!hasAnswerInput || isSubmitting || isAnalyzing}
              className="btn btn-success btn-large"
            >
              {isSubmitting || isAnalyzing ? t('processing') : t('submitAnswer')}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {(isAnalyzing || analysisResult) && (
          <div className="analysis-section">
            <AnalysisDisplay
              result={analysisResult}
              isLoading={isAnalyzing}
            />

            {analysisResult && (
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setTextAnswer('');
                  setTranscription('');
                  setAnalysisResult(null);
                }}
                className="btn btn-primary"
              >
                {t('tryAnotherQuestion')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
