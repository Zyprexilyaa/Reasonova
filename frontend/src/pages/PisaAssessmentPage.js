import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
const SUBJECTS = [
    {
        key: 'mathematics',
        title: 'Mathematics',
        description: 'PISA-style mathematics challenges with friendly explanations and practice prompts.',
        badge: 'Ready',
        ready: true,
        path: '/pisa/mathematics',
    },
    {
        key: 'science',
        title: 'Science',
        description: 'Hands-on science reasoning activities and evidence-based prompts coming soon.',
        badge: 'Coming soon',
        ready: false,
        path: '/pisa/science',
    },
    {
        key: 'reading',
        title: 'Reading',
        description: 'Reading comprehension and text interpretation tasks will be added here soon.',
        badge: 'Coming soon',
        ready: false,
        path: '/pisa/reading',
    },
    {
        key: 'collaborative',
        title: 'Collaborative Problem Solving',
        description: 'Team-based reasoning challenges and scenario prompts will appear here soon.',
        badge: 'Coming soon',
        ready: false,
        path: '/pisa/collaborative',
    },
    {
        key: 'global',
        title: 'Global Competence',
        description: 'Cross-cultural and global citizenship scenarios to support future practice.',
        badge: 'Coming soon',
        ready: false,
        path: '/pisa/global',
    },
    {
        key: 'creative',
        title: 'Creative Thinking',
        description: 'Creative challenge prompts and open-ended tasks are being prepared.',
        badge: 'Coming soon',
        ready: false,
        path: '/pisa/creative',
    },
];
export const PisaAssessmentPage = () => {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const { language } = useLanguage();
    const [selectedSubject, setSelectedSubject] = useState('mathematics');
    const selectedCard = useMemo(() => SUBJECTS.find((item) => item.key === selectedSubject) ?? SUBJECTS[0], [selectedSubject]);
    return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83C\uDF08 PISA Learning Studio" }), _jsx("h1", { className: "pisa-title", children: "Explore the new PISA assessment experience" }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                        ? 'เลือกหัวข้อที่ต้องการฝึกได้ทันที พร้อมหน้าตาแบบน่ารักและเข้าถึงได้ทั้งครูและนักเรียน'
                                        : 'Choose a subject to practice with a playful experience that works for both teachers and students.' })] }), _jsxs("div", { className: "pisa-actions", children: [_jsx("button", { className: "pisa-btn primary", onClick: () => navigate('/pisa/mathematics'), children: language === 'th' ? 'เริ่มคณิตศาสตร์' : 'Start Mathematics' }), _jsx(Link, { className: "pisa-btn secondary", to: "/home", children: language === 'th' ? 'กลับหน้าหลัก' : 'Back to home' })] })] }), _jsx("section", { className: "pisa-card", children: _jsx("div", { className: "pisa-grid", children: SUBJECTS.map((subject) => (_jsxs("button", { className: `pisa-subject-card ${subject.ready ? 'ready' : ''}`, onClick: () => setSelectedSubject(subject.key), style: { textAlign: 'left', cursor: 'pointer' }, children: [_jsx("span", { className: "pisa-badge", children: subject.badge }), _jsx("h3", { children: subject.title }), _jsx("p", { children: subject.description }), subject.ready ? (_jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn secondary", to: subject.path, children: language === 'th' ? 'เปิดหน้า' : 'Open' }) })) : (_jsx("div", { className: "pisa-metadata", children: _jsx("span", { children: language === 'th' ? 'พร้อมให้ครูและนักเรียนดู' : 'Visible to teachers and students' }) }))] }, subject.key))) }) }), _jsxs("section", { className: "pisa-card pisa-quiz", children: [_jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: selectedCard.title }), _jsx("p", { children: selectedCard.description }), _jsxs("div", { className: "pisa-metadata", children: [_jsxs("span", { children: [language === 'th' ? 'สถานะ' : 'Status', ": ", selectedCard.badge] }), _jsxs("span", { children: [language === 'th' ? 'ผู้เข้าถึง' : 'Access', ": ", userRole ? `${userRole}` : 'student'] })] })] }), selectedCard.ready ? (_jsx("div", { className: "pisa-answer", children: language === 'th'
                                ? 'หน้านี้พร้อมใช้งานแล้วสำหรับการฝึกและติดตามผลในแบบฝึกหัด PISA'
                                : 'This page is ready for practice and progress tracking in the PISA learning flow.' })) : (_jsx("div", { className: "pisa-answer", children: language === 'th'
                                ? 'ยังเตรียมเนื้อหาสำหรับวิชานี้อยู่ ตอนนี้จะใช้หน้าจอ Placeholder เพื่อให้ครูและนักเรียนเห็นโครงสร้างก่อน'
                                : 'This subject is being prepared. A placeholder page is ready so teachers and students can see the structure before full content arrives.' }))] })] }) }));
};
