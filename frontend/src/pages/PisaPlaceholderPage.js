import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
const SUBJECT_LABELS = {
    mathematics: { title: 'Mathematics', description: 'A friendly PISA-style mathematics practice experience is ready and accessible to teachers and students.' },
    science: { title: 'Science', description: 'Science content will be added here soon. The placeholder is now visible for both teachers and students.' },
    reading: { title: 'Reading', description: 'Reading tasks are now active. The page includes a sample PISA passage and an AI-assisted written-response workflow.' },
    collaborative: { title: 'Collaborative Problem Solving', description: 'Collaborative tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
    global: { title: 'Global Competence', description: 'Global competence tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
    creative: { title: 'Creative Thinking', description: 'Creative thinking tasks will be added here soon. The placeholder is now visible for both teachers and students.' },
};
export const PisaPlaceholderPage = () => {
    const { subject } = useParams();
    const { language } = useLanguage();
    const subjectInfo = SUBJECT_LABELS[subject || 'mathematics'] || SUBJECT_LABELS.mathematics;
    return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83E\uDDE9 Subject Placeholder" }), _jsx("h1", { className: "pisa-title", children: subjectInfo.title }), _jsx("p", { className: "pisa-description", children: subjectInfo.description })] }), _jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA home' }) })] }), _jsx("section", { className: "pisa-card", children: _jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'เนื้อหาจะถูกเพิ่มในภายหลัง' : 'Content will be added later' }), _jsx("p", { children: language === 'th'
                                    ? 'ตอนนี้หน้าแบบสำรองนี้พร้อมให้ครูและนักเรียนเข้าถึง เพื่อเตรียมตัวสำหรับชุดข้อสอบจริงในอนาคต'
                                    : 'The placeholder page is now accessible to both teachers and students so the space is ready for the real assessments later.' })] }) })] }) }));
};
