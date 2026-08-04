import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AudioRecorder } from '../components/AudioRecorder';
import { AnalysisDisplay } from '../components/AnalysisDisplay';
import { SpeechToTextPanel } from '../components/SpeechToTextPanel';
import { cleanupAudioUrl } from '../services/storage';
import { analyzeStudentAnswer, transcribeAudio } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
export const QuestionPage = ({ question, studentId, proposition, // NEW: destructure proposition
onAnalysisComplete, // NEW: destructure callback
 }) => {
    const { t, language } = useLanguage();
    const [inputMethod, setInputMethod] = useState('voice');
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [supportText, setSupportText] = useState('');
    const [transcription, setTranscription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleRecordingComplete = (blob, url) => {
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
            }
            catch {
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
        }
        else if (inputMethod === 'voice') {
            if (!audioBlob || !audioUrl) {
                setError(t('pleaseRecordAnswer'));
                return;
            }
            try {
                setIsSubmitting(true);
                setError(null);
                finalTranscription = await transcribeAudio(audioBlob);
                setTranscription(finalTranscription);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Transcription error');
                setIsSubmitting(false);
                return;
            }
        }
        else {
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
                language: language, // NEW: pass language
            }, audioBlob || undefined);
            setAnalysisResult(result);
            if (onAnalysisComplete) {
                onAnalysisComplete(result);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('unknownError');
            // Provide better error messages for common issues
            if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
                setError('🔄 API Busy: The AI service is experiencing high demand. The system will automatically retry (up to 3 times). Please wait...');
            }
            else if (errorMessage.includes('429')) {
                setError('⏳ Too many requests. Please wait a moment and try again.');
            }
            else {
                setError(errorMessage);
            }
        }
        finally {
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
    return (_jsx("div", { className: "question-page", children: _jsxs("div", { className: "question-container", children: [_jsxs("div", { className: "question-section", children: [_jsx("h1", { children: t('question') }), _jsxs("div", { className: "question-content", children: [question.questionImage && (_jsx("img", { src: question.questionImage, alt: "Question", className: "question-image" })), proposition?.questionType !== 'pdf' && (_jsx("p", { className: "question-text", children: question.questionText })), proposition?.questionType === 'choice' ? (proposition.options?.length ? (_jsxs("div", { className: "question-context", style: { marginBottom: 16 }, children: [_jsx("strong", { children: "Choose one answer:" }), _jsx("div", { className: "choice-grid", children: proposition.options.map((option, index) => (_jsx("button", { type: "button", onClick: () => setSelectedChoice(option), className: `choice-option ${selectedChoice === option ? 'active' : ''}`, children: option }, index))) })] })) : (_jsxs("div", { className: "question-context", style: { marginBottom: 16 }, children: [_jsx("strong", { children: "This question is multiple choice." }), _jsx("p", { style: { marginTop: 8 }, children: "The choice options are not currently available for this question. You can still type your answer below, or choose another question." })] }))) : null, ((proposition?.sourceType === 'pdf' || proposition?.pdfUrl) && (proposition?.pdfSliceUrl || proposition?.pdfUrl)) ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "question-context", style: { backgroundColor: '#fff4e5', borderColor: '#f59e0b' }, children: [_jsx("strong", { children: "PDF Question" }), _jsx("p", { style: { marginTop: 8 }, children: "The full question is shown in the embedded PDF below. Please read the PDF page carefully and answer based on that content." })] }), _jsxs("div", { className: "question-context", children: [_jsx("strong", { children: "PDF Viewer" }), _jsx("div", { style: { marginTop: 8, minHeight: 760, border: '1px solid #d1d5db' }, children: _jsx("object", { data: proposition.pdfSliceUrl || proposition.pdfUrl, type: "application/pdf", width: "100%", height: "760", "aria-label": "PDF Viewer", children: _jsxs("p", { style: { padding: 16, color: '#333' }, children: ["Your browser does not support inline PDFs. You can", ' ', _jsx("a", { href: proposition.pdfSliceUrl || proposition.pdfUrl, target: "_blank", rel: "noreferrer", children: "open the PDF in a new tab" }), "."] }) }) }), proposition.sourcePageRange ? (_jsxs("p", { style: { marginTop: 8, fontSize: 14, color: '#555' }, children: ["Showing page", proposition.sourcePageRange.includes('-') ? 's' : '', ": ", proposition.sourcePageRange] })) : proposition.sourcePage ? (_jsxs("p", { style: { marginTop: 8, fontSize: 14, color: '#555' }, children: ["Showing page: ", proposition.sourcePage] })) : proposition.pdfFileName ? (_jsxs("p", { style: { marginTop: 8, fontSize: 14, color: '#555' }, children: ["Source PDF: ", proposition.pdfFileName] })) : null] })] })) : null, supportText && (_jsxs("div", { className: "question-context", style: { marginTop: 16 }, children: [_jsx("strong", { children: "Answer guidance" }), _jsx("pre", { style: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: 8 }, children: supportText })] })), question.context && (_jsxs("div", { className: "question-context", children: [_jsx("strong", { children: "Context:" }), _jsx("p", { children: question.context })] }))] })] }), !analysisResult && (_jsxs("div", { className: "recording-section", children: [_jsx("h2", { children: t('recordAnswer') }), _jsx("p", { className: "instructions", children: t('instructions') }), proposition?.questionType === 'choice' && hasChoiceOptions ? (_jsxs("div", { className: "question-context", style: { marginBottom: '1.5rem' }, children: [_jsx("strong", { children: "Select one answer option and submit." }), _jsx("p", { style: { marginTop: 8, color: '#444' }, children: "Once you choose an option, press submit to receive analysis and feedback." })] })) : proposition?.questionType === 'choice' && !hasChoiceOptions ? (_jsxs("div", { className: "question-context", style: { marginBottom: '1.5rem' }, children: [_jsx("strong", { children: "Choice question without options" }), _jsx("p", { style: { marginTop: 8, color: '#444' }, children: "If this question has answer choices, they are not loaded yet. Please type your best answer, or select another question." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "input-method-selector", children: [_jsxs("label", { children: [t('selectInputMethod'), ":"] }), _jsxs("div", { className: "method-buttons", children: [_jsxs("button", { className: `method-btn ${inputMethod === 'voice' ? 'active' : ''}`, onClick: () => setInputMethod('voice'), children: ["\uD83C\uDFA4 ", t('voiceRecording')] }), _jsxs("button", { className: `method-btn ${inputMethod === 'text' ? 'active' : ''}`, onClick: () => setInputMethod('text'), children: ["\u2328\uFE0F ", t('typingAnswer')] })] })] }), inputMethod === 'voice' && (_jsx(AudioRecorder, { onRecordingComplete: handleRecordingComplete, disabled: isSubmitting || isAnalyzing })), inputMethod === 'text' && (_jsxs(_Fragment, { children: [_jsx("textarea", { className: "text-input", value: textAnswer, onChange: (e) => setTextAnswer(e.target.value), placeholder: t('typeYourAnswer'), disabled: isSubmitting || isAnalyzing, rows: 6 }), _jsx(SpeechToTextPanel, { value: textAnswer, onChange: setTextAnswer, placeholder: t('typeYourAnswer'), lang: "th-TH,en-US", label: "Speech to text" })] }))] })), error && _jsx("div", { className: "error-alert", children: error }), _jsx("button", { onClick: handleSubmitAnswer, disabled: !hasAnswerInput || isSubmitting || isAnalyzing, className: "btn btn-success btn-large", children: isSubmitting || isAnalyzing ? t('processing') : t('submitAnswer') })] })), (isAnalyzing || analysisResult) && (_jsxs("div", { className: "analysis-section", children: [_jsx(AnalysisDisplay, { result: analysisResult, isLoading: isAnalyzing }), analysisResult && (_jsx("button", { onClick: () => {
                                setAudioBlob(null);
                                setAudioUrl(null);
                                setTextAnswer('');
                                setTranscription('');
                                setAnalysisResult(null);
                            }, className: "btn btn-primary", children: t('tryAnotherQuestion') }))] }))] }) }));
};
