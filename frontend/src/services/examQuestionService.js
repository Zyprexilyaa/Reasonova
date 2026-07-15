import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';
const PDF_TEXT_INDEX_URL = '/pdf_text2/extracted_questions.json';
const DEFAULT_PDF_SCORING_RUBRIC = {
    excellent: { points: 3, description: 'Clear and complete answer to the PDF question with correct reasoning.' },
    good: { points: 2, description: 'Mostly correct answer with some reasoning.' },
    fair: { points: 1, description: 'Partial answer or limited reasoning.' },
};
function getPdfFileName(sourceFile) {
    return sourceFile.replace(/\.txt$/i, '.pdf');
}
function parsePdfPageNumbers(prompt) {
    const matches = prompt.match(/---\s*PAGE\s*(\d+)\s*---/gi);
    if (!matches) {
        return [];
    }
    return matches
        .map((marker) => {
        const match = marker.match(/(\d+)/);
        return match ? Number(match[1]) : NaN;
    })
        .filter((page) => !Number.isNaN(page));
}
function normalizePrompt(prompt) {
    return prompt
        .replace(/---\s*PAGE\s*\d+\s*---/gi, '')
        .replace(/ตัวอยางขอสอบคณิตศาสตร PISA 2012/gi, '')
        .replace(/\r\n|\r|\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function formatPageSliceName(questionNumber, pages, lineIndex) {
    if (pages.length === 1) {
        return `q${questionNumber}-page-${pages[0]}-${lineIndex}.pdf`;
    }
    const minPage = Math.min(...pages);
    const maxPage = Math.max(...pages);
    return `q${questionNumber}-pages-${minPage}-${maxPage}-${lineIndex}.pdf`;
}
function formatPageRange(pages) {
    if (pages.length === 1) {
        return `${pages[0]}`;
    }
    const sortedPages = Array.from(new Set(pages)).sort((a, b) => a - b);
    return `${sortedPages[0]}-${sortedPages[sortedPages.length - 1]}`;
}
function inferQuestionType(prompt) {
    const normalized = prompt.replace(/\s+/g, ' ').trim();
    const yesNoMatch = /ใช่\s*\/\s*ไม่ใช่|ไม่ใช่\s*\/\s*ใช่|ใช่\s*หรือ\s*ไม่ใช่/i.test(normalized);
    const choicePrompt = /เลือกตอบ|เลือกข้อตอบ|เลือกข้อ|1\s*[,\/ ]\s*2\s*[,\/ ]\s*3\s*[,\/ ]\s*4|1\s*2\s*3\s*4|1\s*หรือ\s*2/i.test(normalized);
    if (yesNoMatch) {
        return { questionType: 'choice', options: ['ใช่', 'ไม่ใช่'] };
    }
    if (choicePrompt) {
        return { questionType: 'choice', options: ['1', '2', '3', '4'] };
    }
    return { questionType: 'pdf' };
}
function mapExtractedQuestion(raw) {
    const pdfFileName = getPdfFileName(raw.sourceFile);
    const sourceBase = pdfFileName.replace(/\.pdf$/i, '');
    const pageNumbers = parsePdfPageNumbers(raw.prompt);
    const hasPageNumbers = pageNumbers.length > 0;
    const id = `${sourceBase}-${raw.questionNumber}-${raw.lineIndex}`;
    const pdfSliceFileName = hasPageNumbers ? formatPageSliceName(raw.questionNumber, pageNumbers, raw.lineIndex) : undefined;
    const pdfSliceUrl = hasPageNumbers ? `/pdf_questions/${sourceBase}/${pdfSliceFileName}` : undefined;
    const normalizedQuestion = normalizePrompt(raw.prompt);
    const inferred = inferQuestionType(normalizedQuestion);
    return {
        id,
        title: `${sourceBase} Q${raw.questionNumber}`,
        sourceFile: raw.sourceFile,
        questionText: normalizedQuestion,
        difficulty: 'hard',
        category: 'problem-solving',
        expectedAnswer: 'Answer the PISA question using the PDF prompt and supporting rubric.',
        scoringRubric: DEFAULT_PDF_SCORING_RUBRIC,
        language: 'th',
        sourceType: 'pdf',
        questionType: inferred.questionType,
        options: inferred.options,
        answerFileUrl: `/answer_guides/${id}.txt`,
        pdfUrl: `/pdfs/${pdfFileName}`,
        pdfFileName,
        pdfSliceUrl,
        sourcePage: hasPageNumbers ? pageNumbers[0] : undefined,
        sourcePageRange: hasPageNumbers ? formatPageRange(pageNumbers) : undefined,
        questionNumber: raw.questionNumber,
    };
}
async function loadExtractedPdfQuestionTemplates(language = 'th') {
    if (language !== 'th') {
        return PDF_EXAM_QUESTION_TEMPLATES.filter(item => item.language === language);
    }
    try {
        const response = await fetch(PDF_TEXT_INDEX_URL);
        if (!response.ok) {
            throw new Error(`Unable to load extracted PDF questions (${response.status})`);
        }
        const rawData = await response.json();
        const questions = [];
        for (const sourceFile of Object.keys(rawData)) {
            const items = rawData[sourceFile] || [];
            for (const item of items) {
                questions.push(mapExtractedQuestion(item));
            }
        }
        if (questions.length > 0) {
            return questions;
        }
    }
    catch (error) {
        console.warn('Could not load extracted PDF questions:', error);
    }
    return PDF_EXAM_QUESTION_TEMPLATES.filter(item => item.language === language);
}
export const PDF_EXAM_QUESTION_TEMPLATES = [
    {
        id: 'pisa-old-test-1',
        title: 'PISA Old Test 1',
        questionText: 'Open the attached PISA PDF and answer the exam question inside. PDF1 is currently scanned and requires OCR from the source file.',
        difficulty: 'hard',
        category: 'comprehension',
        expectedAnswer: 'Answer the question described in the attached PDF.',
        language: 'th',
        scoringRubric: {
            excellent: { points: 3, description: 'Clear and complete answer to the PISA PDF question.' },
            good: { points: 2, description: 'Mostly correct answer with some reasoning.' },
            fair: { points: 1, description: 'Partial answer or limited reasoning.' },
        },
        sourceType: 'pdf',
        questionType: 'pdf',
        answerFileUrl: '/answer_guides/pisa-old-test-1.txt',
        pdfUrl: '/pdfs/pisa-old-test-1.pdf',
        pdfFileName: 'pisa-old-test-1.pdf',
    },
    {
        id: 'pisa-old-test-2',
        title: 'PISA Old Test 2',
        questionText: 'Open the attached PISA PDF and answer the exam question inside.',
        difficulty: 'hard',
        category: 'comprehension',
        expectedAnswer: 'Answer the question described in the attached PDF.',
        language: 'th',
        questionType: 'pdf',
        answerFileUrl: '/answer_guides/pisa-old-test-2.txt',
        scoringRubric: {
            excellent: { points: 3, description: 'Clear and complete answer to the PISA PDF question.' },
            good: { points: 2, description: 'Mostly correct answer with some reasoning.' },
            fair: { points: 1, description: 'Partial answer or limited reasoning.' },
        },
        sourceType: 'pdf',
        pdfUrl: '/pdfs/pisa-old-test-2.pdf',
        pdfFileName: 'pisa-old-test-2.pdf',
    },
    {
        id: 'pisa-old-test-3',
        title: 'PISA Old Test 3',
        questionText: 'Open the attached PISA PDF and answer the exam question inside.',
        difficulty: 'hard',
        category: 'comprehension',
        expectedAnswer: 'Answer the question described in the attached PDF.',
        language: 'th',
        scoringRubric: {
            excellent: { points: 3, description: 'Clear and complete answer to the PISA PDF question.' },
            good: { points: 2, description: 'Mostly correct answer with some reasoning.' },
            fair: { points: 1, description: 'Partial answer or limited reasoning.' },
        },
        sourceType: 'pdf',
        questionType: 'pdf',
        answerFileUrl: '/answer_guides/pisa-old-test-3.txt',
        pdfUrl: '/pdfs/pisa-old-test-3.pdf',
        pdfFileName: 'pisa-old-test-3.pdf',
    },
];
export async function saveExamQuestion(question) {
    try {
        const docRef = await addDoc(collection(db, 'examQuestions'), {
            ...question,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    }
    catch (error) {
        console.error('Error saving exam question:', error);
        throw error;
    }
}
export async function getExamQuestions(language = 'th') {
    try {
        const q = query(collection(db, 'examQuestions'), where('language', '==', language), where('sourceType', '==', 'pdf'));
        const snapshot = await getDocs(q);
        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        if (questions.length === 0) {
            return await loadExtractedPdfQuestionTemplates(language);
        }
        return questions;
    }
    catch (error) {
        console.error('Error getting exam questions:', error);
        return await loadExtractedPdfQuestionTemplates(language);
    }
}
export async function getExamQuestionById(id, language = 'th') {
    try {
        const docRef = doc(db, 'examQuestions', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return {
                id: snapshot.id,
                ...snapshot.data(),
            };
        }
    }
    catch (error) {
        console.error('Error getting exam question by ID:', error);
    }
    const templates = await loadExtractedPdfQuestionTemplates(language);
    return templates.find(item => item.id === id) ?? null;
}
export async function getRandomExamQuestion(language = 'th') {
    try {
        const questions = await getExamQuestions(language);
        if (questions.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
    }
    catch (error) {
        console.error('Error getting random exam question:', error);
        return null;
    }
}
export function getAnswerMethod(question) {
    if (question.sourceType === 'pdf') {
        const pageInfo = question.sourcePageRange
            ? ` pages ${question.sourcePageRange}`
            : question.sourcePage
                ? ` page ${question.sourcePage}`
                : '';
        return `Use the PDF snippet and source material${pageInfo}. Read the diagram or problem statement carefully, then answer using clear reasoning and direct reference to the PDF content.`;
    }
    switch (question.category) {
        case 'comprehension':
            return 'Read the question text carefully, identify the main idea, and answer with a concise explanation that shows understanding of the scenario.';
        case 'analysis':
            return 'Analyze the situation step by step. Include causes, effects, and your reasoning to support the final answer.';
        case 'problem-solving':
            return 'Break the problem into steps, explain your reasoning clearly, and show how you reached your conclusion.';
        case 'critical-thinking':
            return 'Consider different viewpoints, compare alternatives, and justify your response with logical evidence.';
        default:
            return 'Answer the question with clear reasoning and support your response with specific details from the question text.';
    }
}
export async function deleteAllExamQuestions() {
    try {
        const snapshot = await getDocs(collection(db, 'examQuestions'));
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    }
    catch (error) {
        console.error('Error clearing exam questions:', error);
        throw error;
    }
}
export async function importPdfExamQuestions(language = 'th') {
    try {
        const existing = await getDocs(query(collection(db, 'examQuestions'), where('language', '==', language), where('sourceType', '==', 'pdf')));
        if (!existing.empty) {
            return existing.docs.map(doc => doc.id);
        }
        const templates = await loadExtractedPdfQuestionTemplates(language);
        const ids = await Promise.all(templates.map(async (template) => {
            const docRef = await addDoc(collection(db, 'examQuestions'), {
                ...template,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        }));
        return ids;
    }
    catch (error) {
        console.error('Error importing PDF exam questions:', error);
        throw error;
    }
}
