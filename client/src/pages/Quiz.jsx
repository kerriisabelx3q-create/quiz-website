import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function Quiz() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/public/quiz/${categoryId}`);
        setQuizData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [categoryId]);

  const handleSelectOption = (questionId, optionLabel) => {
    setAnswers({ ...answers, [questionId]: optionLabel });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizData.questions.length) {
      if (!window.confirm('Bạn chưa hoàn thành tất cả câu hỏi. Vẫn nộp bài?')) return;
    }
    setSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('quizUserInfo') || '{}');
      const res = await api.post('/public/submit', {
        categoryId,
        userInfo,
        answers,
        questionIds: quizData.questions.map(q => q.id)
      });
      navigate('/result', { state: { score: res.data.score, total: res.data.totalQuestions, details: res.data.details } });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi nộp bài!');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{textAlign: 'center'}}>Đang tải câu hỏi...</div>;
  if (!quizData || quizData.questions.length === 0) return <div className="container">Chưa có câu hỏi cho phần thi này.</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>{quizData.category.name}</h2>
      
      {quizData.questions.map((q, index) => (
        <div key={q.id} className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Câu {index + 1}: {q.content}</h3>
          <div>
            {q.options.map(opt => (
              <div 
                key={opt.label} 
                className={`option-item ${answers[q.id] === opt.label ? 'selected' : ''}`}
                onClick={() => handleSelectOption(q.id, opt.label)}
              >
                <div className="option-label">{opt.label}</div>
                <div style={{ flex: 1 }}>{opt.text}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          className="btn btn-success" 
          style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Đang nộp...' : 'Nộp Bài'}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
