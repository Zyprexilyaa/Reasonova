import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Question } from '../types';
import { QuestionPage } from './QuestionPage';
import { getClassroomById, Classroom, ClassroomSubmission, saveClassroomSubmission } from '../services/classroomService';
import { getExamQuestionById, ExamQuestionData } from '../services/examQuestionService';
import './Classroom.css';

export const ClassroomProblemPage: React.FC = () => {
  const { classroomId, propositionId } = useParams<{ classroomId: string; propositionId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [question, setQuestion] = useState<ExamQuestionData | null>(null);
  const [classroomName, setClassroomName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.uid || `student-${Math.random().toString(36).slice(2, 10)}`;

  useEffect(() => {
    const load = async () => {
      if (!propositionId || !classroomId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Load classroom name for submission
        const cls = await getClassroomById(classroomId);
        if (cls) setClassroomName(cls.className);

        const found = await getExamQuestionById(propositionId);

        setQuestion(found);
        if (!found) {
          setError('Problem not found or not assigned.');
        }
      } catch (err) {
        console.error('Error loading proposition', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propositionId, classroomId]);

  if (userRole && userRole !== 'student') {
    return (
      <div className="classroom-page">
        <div className="classroom-container">
          <div className="error-alert">This view is for students only.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="classroom-page">
        <div className="classroom-container">
          <div className="loading">Loading problem...</div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="classroom-page">
        <div className="classroom-container">
          <div className="error-alert">{error || 'Problem not available.'}</div>
          <div className="classroom-footer">
            <button
              onClick={() => navigate(`/classroom/${classroomId}`)}
              className="btn btn-outline"
            >
              ← Back to problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uiQuestion: Question = {
    id: question.id || propositionId!,
    questionText: question.questionText,
    difficulty: question.difficulty,
    subject: question.category,
    referenceAnswer: question.expectedAnswer,
    scoringGuideline: 'Use rubric and expected answer to evaluate reasoning.',
    createdAt: new Date(),
    questionImage: question.questionImage,
    context: question.pdfUrl ? `PDF source: ${question.pdfFileName}` : undefined,
  };

  const handleAnalysisComplete = async (result: any) => {
    if (!question || !user) return;

    const submission: Omit<ClassroomSubmission, 'id'> = {
      classroomId: classroomId!,
      studentId,
      studentName: user?.displayName || user?.email || 'Anonymous Student',
      questionText: question.questionText,
      userAnswer: result.transcription,
      analysisResult: JSON.stringify(result),
      score: result.score,
      submittedAt: new Date(),
      classroomName: classroomName
    };

    try {
      await saveClassroomSubmission(submission);
      console.log('✅ Classroom submission saved automatically');
    } catch (err) {
      console.error('Failed to save classroom submission:', err);
    }
  };

  return (
    <div className="classroom-page">
      <div className="classroom-container">
        <div className="classroom-header">
          <h1>🧠 Classroom Problem</h1>
          <p>{question.questionText.substring(0, 120)}{question.questionText.length > 120 ? '...' : ''}</p>
        </div>

        <div className="classroom-card">
          <QuestionPage
            question={uiQuestion}
            studentId={studentId}
            proposition={question}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>

        <div className="classroom-footer">
          <button
            onClick={() => navigate(`/classroom/${classroomId}`)}
            className="btn btn-outline"
          >
            ← Back to problems
          </button>
        </div>
      </div>
    </div>
  );
};

