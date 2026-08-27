import React, { useState } from 'react';
import TakeTest from './TakeTest';

export default function StudentDashboard({ user, tests, results, setResults, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ongoingTest, setOngoingTest] = useState(null);
  const [recentResult, setRecentResult] = useState(null);

  // या student चे जुने सर्व सबमिशन रेकॉर्ड्स
  const studentResults = results.filter((r) => r.studentId === user.id);
  
  // ज्या टेस्ट्स Published आहेत अशा सर्व टेस्ट्स
  const publishedTests = tests.filter((t) => t.status === 'published');

  // 🔒 महत्त्वाचा बदल: आधी सोडवलेल्या Test IDs शोधणे
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

  const handleFinish = (result) => {
    // निकाल सेव्ह करणे
    setResults([result, ...results]);
    setRecentResult(result);
    setOngoingTest(null);
    setActiveTab('results');
  };

  if (ongoingTest) {
    return <TakeTest test={ongoingTest} user={user} onFinishTest={handleFinish} />;
  }

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#065f46', fontSize: '18px' }}>🎉 Test Submitted Successfully!</h3>
                  <p style={{ marginTop: '6px', fontSize: '14px', color: '#166534' }}>
                    <strong>{recentResult.testName}</strong> | Marks Obtained: <strong>{recentResult.marksObtained}/{recentResult.totalMarks}</strong> ({recentResult.percentage}%)
                  </p>
                </div>
                <span className={`badge ${recentResult.status === 'Pass' ? 'badge-pass' : 'badge-fail'}`} style={{ fontSize: '14px', padding: '8px 18px' }}>
                  {recentResult.status.toUpperCase()}
                </span>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '14px', padding: '6px 16px', fontSize: '12px' }} onClick={() => setRecentResult(null)}>
                Dismiss Notice
              </button>
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
                  <p style={{ marginTop: '6px', fontSize: '14px' }}>You have attempted all currently published tests. Check the Results tab to view your scores.</p>
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

          {/* TAB 2: ▶️ START TEST (फक्त शिल्लक राहिलेल्या active tests दिसतील) */}
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
    </div>
  );
}