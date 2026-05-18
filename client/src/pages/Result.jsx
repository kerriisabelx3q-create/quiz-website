import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, details } = location.state || { score: 0, total: 0, details: [] };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
        <h1 style={{ marginBottom: '1rem' }}>Hoàn Thành Bài Thi!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Cảm ơn bạn đã tham gia. Dưới đây là kết quả của bạn:
        </p>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
          {score} / {total}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Quay Về Trang Chủ</button>
      </div>

      {details && details.length > 0 && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Chi tiết đáp án</h2>
          {details.map((item, index) => (
            <div key={item.questionId} className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                {item.isCorrect ? <CheckCircle color="var(--success)" size={28}/> : <XCircle color="var(--danger)" size={28}/>}
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Câu {index + 1}: {item.content}</h3>
              </div>

              <div>
                {item.options.map(opt => {
                  let bgColor = 'rgba(255, 255, 255, 0.05)';
                  let borderColor = 'var(--surface-border)';
                  let labelBg = 'var(--surface)';

                  // If user selected this
                  if (item.userAnswer === opt.label) {
                    if (item.isCorrect) {
                      bgColor = 'rgba(16, 185, 129, 0.15)'; // success bg
                      borderColor = 'var(--success)';
                      labelBg = 'var(--success)';
                    } else {
                      bgColor = 'rgba(239, 68, 68, 0.15)'; // danger bg
                      borderColor = 'var(--danger)';
                      labelBg = 'var(--danger)';
                    }
                  } else if (item.correctAnswer === opt.label) {
                    // Correct answer that user missed
                    bgColor = 'rgba(16, 185, 129, 0.15)'; 
                    borderColor = 'var(--success)';
                    labelBg = 'var(--success)';
                  }

                  return (
                    <div 
                      key={opt.label} 
                      className="option-item"
                      style={{
                        background: bgColor,
                        borderColor: borderColor,
                        cursor: 'default'
                      }}
                    >
                      <div className="option-label" style={{ background: labelBg, borderColor: borderColor, color: labelBg !== 'var(--surface)' ? 'white' : 'inherit' }}>
                        {opt.label}
                      </div>
                      <div style={{ flex: 1 }}>{opt.text}</div>
                    </div>
                  );
                })}
              </div>

              {!item.isCorrect && (
                <div style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 'bold' }}>
                  Đáp án đúng là: {item.correctAnswer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Result;
