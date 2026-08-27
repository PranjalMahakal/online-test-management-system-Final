import React, { useState, useEffect } from 'react';

export default function TakeTest({ test, user, onFinishTest }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [startTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('⏰ Time is up! Submitting your test automatically.');
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (idx) => {
    setAnswers({ ...answers, [currentIdx]: idx });
  };

  const handleSubmit = () => {
    let marksObtained = 0;
    let totalMarks = 0;
    let attempted = 0;

    test.questions.forEach((q, i) => {
      totalMarks += (q.marks || 1);
      if (answers[i] !== undefined) {
        attempted += 1;
        if (answers[i] === q.correctOption) {
          marksObtained += (q.marks || 1);
        }
      }
    });

    const percentage = totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(1) : 0;
    const status = percentage >= 40 ? 'Pass' : 'Fail';

    const result = {
      id: Date.now(),
      testId: test.id, // 🔒 Test ID link केले
      studentId: user.id,
      studentName: user.name,
      testName: test.title,
      subject: test.subject,
      startTime,
      endTime: new Date().toLocaleTimeString(),
      totalQuestions: test.questions.length,
      attempted,
      unanswered: test.questions.length - attempted,
      totalMarks,
      marksObtained,
      percentage,
      status
    };

    onFinishTest(result);
  };

  const q = test.questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
      {/* Top Test Header Card */}
      <div className="card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{test.title}</h2>
          <span style={{ opacity: 0.9, fontSize: '14px', fontWeight: 600 }}>Subject: {test.subject}</span>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          padding: '10px 20px',
          borderRadius: '14px',
          fontSize: '18px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⏳ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '13px', letterSpacing: '0.5px' }}>
            QUESTION {currentIdx + 1} OF {test.questions.length}
          </span>
          <span className="badge badge-published" style={{ fontSize: '12px' }}>
            {q.marks || 1} Marks
          </span>
        </div>

        <h3 style={{ fontSize: '20px', color: '#0f172a', fontWeight: 700, marginBottom: '28px', lineHeight: 1.4 }}>
          {q.questionText}
        </h3>

        {/* Options List */}
        <div>
          {q.options.map((option, optIdx) => (
            <div
              key={optIdx}
              className={`quiz-option-card ${answers[currentIdx] === optIdx ? 'selected' : ''}`}
              onClick={() => handleSelect(optIdx)}
            >
              <div className="option-alphabet-circle">
                {String.fromCharCode(65 + optIdx)}
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{option}</span>
            </div>
          ))}
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
          <button
            className="btn btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((c) => c - 1)}
            style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>

          {currentIdx < test.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIdx((c) => c + 1)}>
              Next Question →
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit}>
              ✅ Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}