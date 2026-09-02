import { useState, useEffect, useCallback } from 'react';

export default function TakeTest({ test, user, onFinishTest, onSaveResult }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [startTime] = useState(new Date().toLocaleTimeString());
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleSelect = (idx) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
  };

  const handleSubmit = useCallback(() => {
    let marksObtained = 0;
    let totalMarks = 0;
    let attempted = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const questionSnapshots = test.questions.map((q, i) => {
      const qMarks = q.marks || 1;
      totalMarks += qMarks;
      const selectedOption = answers[i] !== undefined ? answers[i] : null;
      const isSkipped = selectedOption === null || selectedOption === undefined;
      const isCorrect = !isSkipped && selectedOption === q.correctOption;

      if (!isSkipped) {
        attempted += 1;
        if (isCorrect) {
          correctCount += 1;
          marksObtained += qMarks;
        } else {
          wrongCount += 1;
        }
      }

      return {
        id: q.id || i + 1,
        questionText: q.questionText,
        options: q.options || [],
        correctOption: q.correctOption,
        selectedOption,
        isCorrect,
        isSkipped,
        marksEarned: isCorrect ? qMarks : 0,
        marks: qMarks
      };
    });

    const timeTakenSeconds = (test.duration * 60) - Math.max(0, timeLeft);
    const takenMins = Math.floor(timeTakenSeconds / 60);
    const takenSecs = timeTakenSeconds % 60;
    const timeTakenStr = `${takenMins}m ${takenSecs < 10 ? '0' : ''}${takenSecs}s`;

    const percentage = totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(1) : '0.0';
    const status = parseFloat(percentage) >= 40 ? 'Pass' : 'Fail';

    const result = {
      id: Date.now(),
      testId: test.id,
      studentId: user.id,
      studentName: user.name,
      testName: test.title,
      subject: test.subject,
      startTime,
      endTime: new Date().toLocaleTimeString(),
      timeTaken: timeTakenStr,
      totalQuestions: test.questions.length,
      attempted,
      unanswered: test.questions.length - attempted,
      correctCount,
      wrongCount,
      totalMarks,
      marksObtained,
      percentage,
      status,
      userAnswers: answers,
      questionSnapshots
    };

    if (onSaveResult) {
      onSaveResult(result);
    }
    setEvaluationResult(result);
  }, [answers, onSaveResult, test, timeLeft, user, startTime]);

  useEffect(() => {
    // If test is already evaluated, stop timer interval
    if (evaluationResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            alert('⏰ Time is up! Submitting your test automatically.');
            handleSubmit();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [evaluationResult, handleSubmit]);

  // ==========================================
  // VIEW 1: IMMEDIATE EVALUATION & ANSWER KEY VIEW
  // ==========================================
  if (evaluationResult) {
    const isPass = evaluationResult.status === 'Pass';

    return (
      <div style={{ maxWidth: '880px', margin: '36px auto', padding: '0 20px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Header Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            padding: '32px 36px',
            borderRadius: '24px',
            boxShadow: '0 12px 28px rgba(79, 70, 229, 0.25)',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '10px'
                }}
              >
                📋 IMMEDIATE TEST EVALUATION & ANSWER KEY
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                {evaluationResult.testName}
              </h1>
              <div style={{ fontSize: '14px', opacity: 0.9, display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span>📚 Subject: <strong>{evaluationResult.subject}</strong></span>
                <span>⏱️ Time Taken: <strong>{evaluationResult.timeTaken}</strong></span>
                <span>👤 Student: <strong>{evaluationResult.studentName}</strong></span>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '14px 22px',
                borderRadius: '18px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.85 }}>
                Final Score
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.1, marginTop: '2px' }}>
                {evaluationResult.marksObtained}
                <span style={{ fontSize: '18px', opacity: 0.85, fontWeight: 600 }}> / {evaluationResult.totalMarks}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800 }}>{evaluationResult.percentage}%</span>
                <span
                  style={{
                    background: isPass ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  {isPass ? 'PASS ✓' : 'FAIL ✗'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pill Stats: Correct, Wrong, Skipped */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {/* Correct Answers Pill */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', lineHeight: 1.1 }}>
                {evaluationResult.correctCount}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginTop: '2px' }}>
                Correct Answers
              </div>
            </div>
          </div>

          {/* Wrong Answers Pill */}
          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800
              }}
            >
              ✗
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', lineHeight: 1.1 }}>
                {evaluationResult.wrongCount}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginTop: '2px' }}>
                Wrong Answers
              </div>
            </div>
          </div>

          {/* Unattempted / Skipped Pill */}
          <div
            style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800
              }}
            >
              —
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', lineHeight: 1.1 }}>
                {evaluationResult.unanswered}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginTop: '2px' }}>
                Skipped / Unattempted
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Question-by-Question Detailed Review
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Compare your selected responses against the official answer key with marks breakdown.
            </p>
          </div>
          <span style={{ background: '#ede9fe', color: '#4338ca', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
            {evaluationResult.questionSnapshots.length} Questions Total
          </span>
        </div>

        {/* Question-by-Question Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {evaluationResult.questionSnapshots.map((q, idx) => (
            <div
              key={q.id || idx}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '18px',
                padding: '24px 28px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Question Header & Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    QUESTION {idx + 1} OF {evaluationResult.totalQuestions}
                  </span>

                  {q.isCorrect ? (
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✓ Correct (+{q.marksEarned} Marks)
                    </span>
                  ) : q.isSkipped ? (
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      — Skipped (0 Marks)
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✗ Incorrect (0 Marks)
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  Weight: {q.marks || 1} {(q.marks || 1) === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>

              {/* Question Text */}
              <h3 style={{ fontSize: '18px', color: '#0f172a', fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.45 }}>
                {q.questionText}
              </h3>

              {/* Skipped Notice */}
              {q.isSkipped && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#b45309',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚠️</span> You did not attempt this question. The correct answer is indicated below in green.
                </div>
              )}

              {/* 4 Options with Color-Coded Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((option, optIdx) => {
                  const isCorrectAnswer = optIdx === q.correctOption;
                  const isStudentSelection = optIdx === q.selectedOption;
                  const isWrongStudentSelection = isStudentSelection && !isCorrectAnswer;

                  let itemBg = '#ffffff';
                  let itemBorder = '1.5px solid #e2e8f0';
                  let itemColor = '#334155';
                  let circleBg = '#f1f5f9';
                  let circleColor = '#64748b';
                  let tag = null;

                  if (isCorrectAnswer) {
                    itemBg = '#ecfdf5';
                    itemBorder = '2px solid #10b981';
                    itemColor = '#065f46';
                    circleBg = '#10b981';
                    circleColor = '#ffffff';
                    tag = (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: '#10b981',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✓ {isStudentSelection ? 'Your Answer (Correct!)' : 'Correct Answer'}
                      </span>
                    );
                  } else if (isWrongStudentSelection) {
                    itemBg = '#fef2f2';
                    itemBorder = '2px solid #ef4444';
                    itemColor = '#991b1b';
                    circleBg = '#ef4444';
                    circleColor = '#ffffff';
                    tag = (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: '#ef4444',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✗ Your Choice (Incorrect)
                      </span>
                    );
                  }

                  return (
                    <div
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        background: itemBg,
                        border: itemBorder,
                        color: itemColor,
                        fontWeight: isCorrectAnswer || isStudentSelection ? 700 : 500,
                        fontSize: '14px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: circleBg,
                          color: circleColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                          flexShrink: 0
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span style={{ flex: 1, lineHeight: 1.4 }}>{option}</span>
                      {tag}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button: Back to Dashboard */}
        <div style={{ textAlign: 'center', marginTop: '36px', marginBottom: '48px' }}>
          <button
            onClick={() => onFinishTest(evaluationResult)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 38px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(79, 70, 229, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE TEST QUESTIONNAIRE VIEW
  // ==========================================
  const q = test.questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
      {/* Top Test Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{test.title}</h2>
          <span style={{ opacity: 0.9, fontSize: '14px', fontWeight: 600 }}>Subject: {test.subject}</span>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
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
            {q.marks || 1} {(q.marks || 1) === 1 ? 'Mark' : 'Marks'}
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