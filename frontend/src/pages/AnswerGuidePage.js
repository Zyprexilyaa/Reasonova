import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnswerMethod, getExamQuestions } from '../services/examQuestionService';
import './Auth.css';
export const AnswerGuidePage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const items = await getExamQuestions('th');
                setQuestions(items);
            }
            catch (err) {
                setError('Unable to load answer guide.');
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    return (_jsx("div", { className: "auth-page", children: _jsx("div", { className: "page-container", children: _jsxs("div", { className: "page-card", children: [_jsx("div", { className: "teacher-actions", style: { marginBottom: 16 }, children: _jsx(Link, { to: "/practice", className: "btn btn-outline", children: "\u2190 Back to Practice" }) }), _jsx("h2", { className: "auth-subtitle", children: "Answer Guide" }), _jsx("p", { style: { marginBottom: 20, color: '#444' }, children: "Each question may require a different strategy. Review the guidance below and open a question to practice with the correct answer method." }), loading && _jsx("div", { children: "Loading answer guide..." }), error && _jsx("div", { className: "error-alert", children: error }), !loading && !error && (_jsx("div", { className: "proposition-list", children: questions.map((question, idx) => (_jsxs("div", { className: "proposition-item", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsxs("h4", { children: [question.questionText.substring(0, 140), question.questionText.length > 140 ? '...' : ''] }), _jsxs("div", { className: "proposition-meta", children: [question.category, " \u2022 ", question.difficulty, question.questionNumber ? ` • Q${question.questionNumber}` : ''] })] }), _jsx(Link, { to: `/practice/question/${question.id || ''}`, className: "btn btn-primary", children: "Practice" })] }), _jsxs("div", { style: { marginTop: 12, color: '#333' }, children: [_jsx("strong", { children: "Recommended answer method:" }), _jsx("p", { children: getAnswerMethod(question) })] }), question.sourceType === 'pdf' && question.sourcePageRange && (_jsxs("div", { style: { marginTop: 8, fontSize: 14, color: '#555' }, children: ["Source pages: ", question.sourcePageRange] }))] }, `${question.id}-${idx}`))) }))] }) }) }));
};
