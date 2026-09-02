import { useState } from 'react';
import TakeTest from './TakeTest';

export default function StudentDashboard({ user, tests, results, setResults, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ongoingTest, setOngoingTest] = useState(null);
  const [recentResult, setRecentResult] = useState(null);
  const [inspectingResult, setInspectingResult] = useState(null);

  // या student चे जुने सर्व सबमिशन रेकॉर्ड्स
  const studentResults = results.filter((r) => r.studentId === user.id);

  // ज्या टेस्ट्स Published आहेत अशा सर्व टेस्ट्स
  const publishedTests = tests.filter((t) => t.status === 'published');

  // 🔒 आधी सोडवलेल्या Test IDs शोधणे
  const completedTestIds = studentResults.map((r) => r.testId || r.testName);

  // 🔒 Available Tests = फक्त अशा टेस्ट्स ज्या या student ने अद्याप सोडवलेल्या नाहीत
  const availableTests = publishedTests.filter(
    (t) => !completedTestIds.includes(t.id) && !completedTestIds.includes(t.title)
  );

  const totalAvailable = availableTests.length;
  const totalCompleted = studentResults.length;
  const avgScore = totalCompleted > 0
    ? (studentResults.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) / totalCompleted).toFixed(1)
    : '0.0';

  // Immediate save on submission
  const handleSaveResult = (result) => {
    setResults((prev) => {
      if (prev.some((r) => r.id === result.id)) return prev;
      return [result, ...prev];
    });
    setRecentResult(result);
  };

  // Finalize flow and transition back to student dashboard
  const handleFinish = (result) => {
    handleSaveResult(result);
    setOngoingTest(null);
    setActiveTab('results');
  };

  // Helper to safely extract or reconstruct question snapshots for review
  const getSubmissionSnapshots = (sub) => {
    if (!sub) return [];
    if (sub.questionSnapshots && sub.questionSnapshots.length > 0) {
      return sub.questionSnapshots;
    }
    // Fallback: reconstruct from matching test definition if old result lacks snapshots
    const matchedTest = tests.find((t) => t.id === sub.testId || t.title === sub.testName);
    if (!matchedTest || !matchedTest.questions) return [];
    const userAnswers = sub.userAnswers || {};
    return matchedTest.questions.map((q, i) => {
      const selectedOption = userAnswers[i] !== undefined ? userAnswers[i] : null;
      const isSkipped = selectedOption === null || selectedOption === undefined;
      const isCorrect = !isSkipped && selectedOption === q.correctOption;
      return {
        id: q.id || i + 1,
        questionText: q.questionText,
        options: q.options || [],
        correctOption: q.correctOption,
        selectedOption,
        isCorrect,
        isSkipped,
        marksEarned: isCorrect ? (q.marks || 1) : 0,
        marks: q.marks || 1
      };
    });
  };

  if (ongoingTest) {
    return (
      <TakeTest
        test={ongoingTest}
        user={user}
        onFinishTest={handleFinish}
        onSaveResult={handleSaveResult}
      />
    );
  }

  const reviewSnapshots = inspectingResult ? getSubmissionSnapshots(inspectingResult) : [];
  const inspectingCorrectCount = inspectingResult?.correctCount ?? reviewSnapshots.filter((q) => q.isCorrect).length;
  const inspectingWrongCount = inspectingResult?.wrongCount ?? reviewSnapshots.filter((q) => !q.isCorrect && !q.isSkipped).length;
  const inspectingSkippedCount = inspectingResult?.unanswered ?? reviewSnapshots.filter((q) => q.isSkipped).length;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">📝</div>
          <span className="nav-brand-title">Online Test Management</span>
        </div>

        <div className="nav-user-info">
          <div className="user-profile-tag">
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{user.name}</span>
            <span className="role-badge">Student</span>
          </div>
          <button className="btn btn-danger" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="app-sidebar">
          <div className="sidebar-heading">Student Panel</div>
          <nav className="sidebar-links">
            <button
              className={`side-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              🏠 Dashboard
            </button>
            <button
              className={`side-btn ${activeTab === 'startTest' ? 'active' : ''}`}
              onClick={() => setActiveTab('startTest')}
            >
              ▶️ Start Test {availableTests.length > 0 && <span className="badge badge-published" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '11px' }}>{availableTests.length}</span>}
            </button>
            <button
              className={`side-btn ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              📊 Results
            </button>
          </nav>
        </aside>

        {/* Dashboard Workspace */}
        <main className="dashboard-main">
          {/* Submission Alert */}
          {recentResult && (
            <div className="card" style={{ borderLeft: '6px solid #10b981', background: '#f0fdf4', marginBottom: '26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ color: '#065f46', fontSize: '18px', margin: '0 0 4px 0' }}>🎉 Test Submitted Successfully!</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                    <strong>{recentResult.testName}</strong> | Score: <strong>{recentResult.marksObtained}/{recentResult.totalMarks}</strong> ({recentResult.percentage}%)
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${recentResult.status === 'Pass' ? 'badge-pass' : 'badge-fail'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                    {recentResult.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setInspectingResult(recentResult)}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    🔍 Review Answers
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                    onClick={() => setRecentResult(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 🏠 DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="welcome-banner">
                <h1>Welcome back, {user.name} 👋</h1>
                <p>Ready to test your knowledge today? Choose an active test to begin.</p>
              </div>

              {/* Stat Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div>
                    <div className="stat-title">Available Tests</div>
                    <div className="stat-value">{totalAvailable}</div>
                  </div>
                  <div className="stat-icon icon-blue">📝</div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-title">Completed</div>
                    <div className="stat-value">{totalCompleted}</div>
                  </div>
                  <div className="stat-icon icon-green">✅</div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-title">Average Score</div>
                    <div className="stat-value">{avgScore}%</div>
                  </div>
                  <div className="stat-icon icon-purple">📈</div>
                </div>
              </div>

              {/* Available Tests Cards */}
              <h2 className="section-title">Pending / Available Tests</h2>
              {availableTests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</div>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>All Caught Up!</strong>
                  <p style={{ marginTop: '6px', fontSize: '14px' }}>You have attempted all currently published tests. Check the Results tab to view your scores and review questions.</p>
                </div>
              ) : (
                <div className="test-grid">
                  {availableTests.map((t) => {
                    const totalMarks = t.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                    return (
                      <div key={t.id} className="test-card-box">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="test-title-text">{t.title}</span>
                            <span className="badge badge-published">Active</span>
                            <span className="badge badge-subject">{t.subject}</span>
                          </div>
                          <div className="test-meta-pills">
                            <span className="meta-chip">📋 {t.questions.length} Questions</span>
                            <span className="meta-chip">🎯 {totalMarks} Total Marks</span>
                            <span className="meta-chip">⏱️ {t.duration} Minutes</span>
                          </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setOngoingTest(t)}>
                          Start Test ▶
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ▶️ START TEST */}
          {activeTab === 'startTest' && (
            <div>
              <h2 className="section-title">Available Assessments</h2>
              {availableTests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '30px', marginBottom: '8px' }}>✅</div>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>No Pending Tests</strong>
                  <p style={{ marginTop: '4px', fontSize: '14px' }}>You have already submitted all available tests.</p>
                </div>
              ) : (
                <div className="test-grid">
                  {availableTests.map((t) => {
                    const totalMarks = t.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                    return (
                      <div key={t.id} className="test-card-box">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="test-title-text">{t.title}</span>
                            <span className="badge badge-subject">{t.subject}</span>
                          </div>
                          <div className="test-meta-pills">
                            <span className="meta-chip">📋 {t.questions.length} Questions</span>
                            <span className="meta-chip">🎯 {totalMarks} Marks</span>
                            <span className="meta-chip">⏱️ {t.duration} Mins</span>
                          </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setOngoingTest(t)}>
                          Start Test ▶
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 📊 RESULTS */}
          {activeTab === 'results' && (
            <div>
              <h2 className="section-title">My Test Results & Activity</h2>
              {studentResults.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  You haven't attempted any tests yet. Go to "Start Test" to begin!
                </div>
              ) : (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Test & Subject</th>
                        <th>Timing (Start - End)</th>
                        <th>Questions (Att./Unatt.)</th>
                        <th>Marks Obtained</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentResults.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{r.testName}</strong><br />
                            <span className="badge badge-subject" style={{ marginTop: '6px', fontSize: '11px', padding: '3px 10px' }}>{r.subject}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{r.startTime}</span> - <span style={{ fontWeight: 600, color: '#475569' }}>{r.endTime}</span>
                          </td>
                          <td>
                            <strong>{r.attempted}</strong> attempted / <span style={{ color: '#ef4444' }}>{r.unanswered} skipped</span>
                            <br /><small style={{ color: '#64748b' }}>Total: {r.totalQuestions} Questions</small>
                          </td>
                          <td>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{r.marksObtained}</span> / {r.totalMarks}
                          </td>
                          <td style={{ fontWeight: 800, fontSize: '15px', color: '#4f46e5' }}>
                            {r.percentage}%
                          </td>
                          <td>
                            <span className={`badge ${r.status === 'Pass' ? 'badge-pass' : 'badge-fail'}`}>
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setInspectingResult(r)}
                              style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                              }}
                            >
                              🔍 Review Answers
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* DETAILED QUESTION EVALUATION & ANSWER KEY MODAL       */}
      {/* ==================================================== */}
      {inspectingResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setInspectingResult(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #e2e8f0',
              padding: '32px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ede9fe', color: '#4338ca', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
                  DETAILED TEST EVALUATION & ANSWER KEY
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {inspectingResult.testName}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Subject: <strong style={{ color: '#4f46e5' }}>{inspectingResult.subject}</strong> • Timing: {inspectingResult.startTime} - {inspectingResult.endTime} • Duration: {inspectingResult.timeTaken || 'Completed'}
                </p>
              </div>
              <button
                onClick={() => setInspectingResult(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 800, color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Score Highlights & 3 Pill Stats */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1.5px solid #e2e8f0',
                borderRadius: '18px',
                padding: '20px 24px',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Evaluation Score
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {inspectingResult.marksObtained}
                  <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}> / {inspectingResult.totalMarks}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '15px' }}>{inspectingResult.percentage}%</span>
                  <span
                    style={{
                      background: inspectingResult.status === 'Pass' ? '#dcfce7' : '#fee2e2',
                      color: inspectingResult.status === 'Pass' ? '#15803d' : '#991b1b',
                      border: `1px solid ${inspectingResult.status === 'Pass' ? '#bbf7d0' : '#fecaca'}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    {inspectingResult.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 3 Pills */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', padding: '12px 18px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>{inspectingCorrectCount}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginTop: '2px' }}>✓ Correct</div>
                </div>
                <div style={{ background: '#ffffff', border: '1.5px solid #fecaca', padding: '12px 18px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b' }}>{inspectingWrongCount}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', marginTop: '2px' }}>✗ Wrong</div>
                </div>
                <div style={{ background: '#ffffff', border: '1.5px solid #fde68a', padding: '12px 18px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#b45309' }}>{inspectingSkippedCount}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', marginTop: '2px' }}>— Skipped</div>
                </div>
              </div>
            </div>

            {/* Review Questions List */}
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Question Breakdown ({reviewSnapshots.length})
            </h3>

            {reviewSnapshots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '14px' }}>
                Question-level details not available for this record.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {reviewSnapshots.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px 22px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '12px', textTransform: 'uppercase' }}>
                          Q{idx + 1}
                        </span>
                        {q.isCorrect ? (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800
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
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800
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
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                          >
                            ✗ Incorrect (0 Marks)
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                        {q.marks || 1} {(q.marks || 1) === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 700, marginBottom: '14px', lineHeight: 1.4 }}>
                      {q.questionText}
                    </div>

                    {q.isSkipped && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                        ⚠️ You skipped this question.
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctOption;
                        const isChosen = optIdx === q.selectedOption;
                        const isWrongChoice = isChosen && !isCorrect;

                        let bg = '#ffffff';
                        let border = '1px solid #e2e8f0';
                        let textColor = '#334155';
                        let badge = null;

                        if (isCorrect) {
                          bg = '#ecfdf5';
                          border = '1.5px solid #10b981';
                          textColor = '#065f46';
                          badge = (
                            <span style={{ marginLeft: 'auto', background: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                              ✓ {isChosen ? 'Your Correct Answer' : 'Correct Answer'}
                            </span>
                          );
                        } else if (isWrongChoice) {
                          bg = '#fef2f2';
                          border = '1.5px solid #ef4444';
                          textColor = '#991b1b';
                          badge = (
                            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                              ✗ Your Choice
                            </span>
                          );
                        }

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: bg,
                              border,
                              color: textColor,
                              fontSize: '13px',
                              fontWeight: isCorrect || isChosen ? 700 : 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <span style={{ fontWeight: 800, width: '20px' }}>{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                            {badge}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setInspectingResult(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}