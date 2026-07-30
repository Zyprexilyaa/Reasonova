import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getClassroomById } from '../services/classroomService';
import { getExamQuestionById, getExamQuestions } from '../services/examQuestionService';
import './Classroom.css';
export const ClassroomContestPage = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [classroom, setClassroom] = useState(null);
    const [assignedQuestions, setAssignedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const load = async () => {
            if (!classroomId) {
                setError('Missing classroomId');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const cls = await getClassroomById(classroomId);
                setClassroom(cls);
                if (!cls || !cls.assignedPropositionIds || cls.assignedPropositionIds.length === 0) {
                    setAssignedQuestions([]);
                    return;
                }
                const allQuestions = await getExamQuestions('th');
                const matched = allQuestions.filter(q => q.id && cls.assignedPropositionIds.includes(q.id));
                const missingIds = cls.assignedPropositionIds.filter(id => !matched.some(q => q.id === id));
                for (const id of missingIds) {
                    const examQuestion = await getExamQuestionById(id);
                    if (examQuestion) {
                        matched.push(examQuestion);
                    }
                }
                setAssignedQuestions(matched);
            }
            catch (err) {
                console.error('Error loading classroom contest data', err);
                setError('Failed to load classroom problems');
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [classroomId]);
    if (userRole && userRole !== 'student') {
        return (_jsx("div", { className: "classroom-page", children: _jsx("div", { className: "classroom-container", children: _jsx("div", { className: "error-alert", children: "This view is for students only." }) }) }));
    }
    return (_jsx("div", { className: "classroom-page", children: _jsxs("div", { className: "classroom-container", children: [_jsxs("div", { className: "classroom-header", children: [_jsx("h1", { children: "\uD83D\uDCDD Classroom Problems" }), _jsx("p", { children: classroom
                                ? `Classroom: ${classroom.className}`
                                : 'Loading classroom information...' })] }), loading && (_jsx("div", { className: "classroom-card", children: _jsx("div", { className: "loading", children: "Loading assigned problems..." }) })), !loading && error && (_jsx("div", { className: "classroom-card", children: _jsx("div", { className: "error-alert", children: error }) })), !loading && !error && assignedQuestions.length === 0 && (_jsx("div", { className: "classroom-card", children: _jsx("p", { className: "no-classrooms", children: "Your teacher has not assigned any problems yet. Please check back later." }) })), !loading && !error && assignedQuestions.length > 0 && (_jsxs("div", { className: "classroom-card", children: [_jsx("h2", { children: "\uD83D\uDCDA Assigned Problems" }), _jsx("div", { className: "classroom-list", children: assignedQuestions.map((q) => (_jsxs("div", { className: "classroom-item", children: [_jsxs("div", { className: "classroom-info", children: [_jsxs("h3", { children: [q.questionText.substring(0, 120), q.questionText.length > 120 ? '...' : ''] }), _jsxs("p", { children: [_jsx("strong", { children: "Category:" }), " ", q.category, " \u2022 ", _jsx("strong", { children: "Difficulty:" }), " ", q.difficulty] })] }), _jsx("div", { className: "classroom-actions", children: _jsx("button", { className: "btn btn-secondary", onClick: () => navigate(`/classroom/${classroomId}/problem/${q.id}`), children: "Start" }) })] }, q.id))) })] })), _jsx("div", { className: "classroom-footer", children: _jsx("button", { onClick: () => navigate('/home'), className: "btn btn-outline", children: "\u2190 Back to Home" }) })] }) }));
};
