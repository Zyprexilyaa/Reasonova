import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
import readingContent from './pisaReadingContent.js';
const readingQuestions = (readingContent.questions ?? []);
export const PisaReadingPage = () => {
    const { language } = useLanguage();
    const [answer, setAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const question = useMemo(() => readingQuestions[0], []);
    const handleSubmit = () => {
        setIsSubmitted(true);
    };
    return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83D\uDCD6 Reading" }), _jsx("h1", { className: "pisa-title", children: "PISA Reading practice" }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                        ? 'แบบฝึกอ่านนี้ใช้บทอ่าน PISA ที่สอดคล้องกับตัวอย่าง PDF และพร้อมเปิดใช้งานระบบ AI ตรวจคำตอบแบบเขียนตอบ'
                                        : 'This reading exercise follows the PISA reading sample and is ready for AI-assisted open-response grading.' })] }), _jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' }) })] }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'บทอ่าน' : 'Reading Passage' }), _jsx("p", { style: { whiteSpace: 'pre-line', lineHeight: 1.8 }, children: readingContent.passage })] }) }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'คำถาม' : 'Question' }), _jsx("p", { style: { fontWeight: 600 }, children: question?.questionText }), _jsx("textarea", { value: answer, onChange: (event) => setAnswer(event.target.value), rows: 8, placeholder: language === 'th' ? 'พิมพ์คำตอบของคุณที่นี่...' : 'Type your answer here...', style: { width: '100%', borderRadius: 12, border: '1px solid #dfeaf5', padding: 12, fontSize: 15, resize: 'vertical' } }), _jsx("div", { className: "pisa-actions", style: { marginTop: 16 }, children: _jsx("button", { className: "pisa-btn primary", onClick: handleSubmit, children: language === 'th' ? 'ส่งคำตอบ' : 'Submit answer' }) }), isSubmitted && (_jsxs("div", { className: "pisa-answer", style: { marginTop: 16 }, children: [_jsx("strong", { children: language === 'th' ? 'ระบบ AI จะตรวจคำตอบแบบเขียนตอบตาม rubric ด้านล่าง' : 'The AI system will grade this written response using the rubric below.' }), _jsx("p", { style: { marginTop: 8, marginBottom: 0 }, children: question?.scoringRubric?.excellent || 'AI-assisted rubric is available for assessment.' })] })), question?.sourcePdfUrl && (_jsxs("div", { style: { marginTop: 16, fontSize: 13, color: '#4d6075' }, children: [language === 'th' ? 'แหล่งข้อมูล PDF:' : 'Source PDF:', " ", question.sourcePdfUrl] }))] }) })] }) }));
};
