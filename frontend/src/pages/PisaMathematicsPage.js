import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './PisaAssessmentPage.css';
export const PisaMathematicsPage = () => {
    const { language } = useLanguage();
    return (_jsx("div", { className: "pisa-assessment-page", children: _jsxs("div", { className: "pisa-shell", children: [_jsxs("section", { className: "pisa-card pisa-hero", children: [_jsxs("div", { children: [_jsx("div", { className: "pisa-eyebrow", children: "\uD83E\uDDEE Mathematics" }), _jsx("h1", { className: "pisa-title", children: "PISA Mathematics practice" }), _jsx("p", { className: "pisa-description", children: language === 'th'
                                        ? 'หน้าแบบฝึกคณิตศาสตร์นี้ออกแบบให้เข้ากับธีมเว็บไซต์ของเรา และพร้อมให้ครูและนักเรียนใช้ร่วมกัน'
                                        : 'This mathematics practice page follows the same playful style as the rest of the site and is ready for both teachers and students.' })] }), _jsx("div", { className: "pisa-actions", children: _jsx(Link, { className: "pisa-btn primary", to: "/pisa", children: language === 'th' ? 'กลับสู่หน้าหลัก PISA' : 'Back to PISA subjects' }) })] }), _jsxs("section", { className: "pisa-card", children: [_jsxs("div", { className: "pisa-question-box", children: [_jsx("h3", { children: language === 'th' ? 'ตัวอย่างข้อสอบ PISA' : 'Sample PISA assessment' }), _jsx("p", { children: language === 'th'
                                        ? 'เนื้อหาตัวอย่างนี้แสดงให้เห็นถึงรูปแบบข้อสอบที่สอดคล้องกับการเรียนรู้แบบ PISA และพร้อมสำหรับการอัปเดตเนื้อหาที่แท้จริงในภายหลัง'
                                        : 'This sample content demonstrates the assessment format and can be expanded with your future subject material.' })] }), _jsx("iframe", { title: "PISA Mathematics sample", src: "/PISA_Math_mock.html", style: { width: '100%', minHeight: '900px', border: '0', borderRadius: '16px', background: '#fff' } })] })] }) }));
};
