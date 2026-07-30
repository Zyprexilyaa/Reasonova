import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnswerMethod, getExamQuestions, ExamQuestionData } from '../services/examQuestionService';
import './Auth.css';

export const AnswerGuidePage: React.FC = () => {
  const [questions, setQuestions] = useState<ExamQuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const items = await getExamQuestions('th');
        setQuestions(items);
      } catch (err) {
        setError('Unable to load answer guide.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="auth-page">
      <div className="page-container">
        <div className="page-card">
          <div className="teacher-actions" style={{ marginBottom: 16 }}>
            <Link to="/practice" className="btn btn-outline">
              ← Back to Practice
            </Link>
          </div>

          <h2 className="auth-subtitle">Answer Guide</h2>
          <p style={{ marginBottom: 20, color: '#444' }}>
            Each question may require a different strategy. Review the guidance below and open a question to practice with the correct answer method.
          </p>

          {loading && <div>Loading answer guide...</div>}
          {error && <div className="error-alert">{error}</div>}

          {!loading && !error && (
            <div className="proposition-list">
              {questions.map((question, idx) => (
                <div key={`${question.id}-${idx}`} className="proposition-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4>{question.questionText.substring(0, 140)}{question.questionText.length > 140 ? '...' : ''}</h4>
                      <div className="proposition-meta">
                        {question.category} • {question.difficulty}
                        {question.questionNumber ? ` • Q${question.questionNumber}` : ''}
                      </div>
                    </div>
                    <Link to={`/practice/question/${question.id || ''}`} className="btn btn-primary">
                      Practice
                    </Link>
                  </div>
                  <div style={{ marginTop: 12, color: '#333' }}>
                    <strong>Recommended answer method:</strong>
                    <p>{getAnswerMethod(question)}</p>
                  </div>
                  {question.sourceType === 'pdf' && question.sourcePageRange && (
                    <div style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
                      Source pages: {question.sourcePageRange}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
