import React, { useState } from 'react';

export default function TeacherDashboard({ user, tests, setTests, results, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wizardStep, setWizardStep] = useState(1);

  // Active Draft Test ID (if editing an existing draft)
  const [editingTestId, setEditingTestId] = useState(null);

  // Test Details
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [questions, setQuestions] = useState([]);

  // Question Form Fields
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctOption, setCorrectOption] = useState(0);
  const [marks, setMarks] = useState(5);
  const [editQId, setEditQId] = useState(null);

  // Teacher Specific Filter
  const myCreatedTests = tests.filter((t) => t.teacherId === user.id);
  const publishedCount = myCreatedTests.filter((t) => t.status === 'published').length;
  const draftCount = myCreatedTests.filter((t) => t.status === 'draft').length;

  const myTestResults = results.filter((r) =>
    myCreatedTests.some((t) => t.title === r.testName && t.subject === r.subject)
  );

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  // Direct Publish from Dashboard
  const handleDirectPublish = (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to publish "${testTitle}" for students now?`)) {
      setTests((prev) =>
        prev.map((t) => (t.id === testId ? { ...t, status: 'published' } : t))
      );
      alert(`🎉 "${testTitle}" is now PUBLISHED and live for students!`);
    }
  };

  // Edit Existing Draft / Published Test
  const handleEditDraftTest = (testObj) => {
    setEditingTestId(testObj.id);
    setTitle(testObj.title);
    setSubject(testObj.subject);
    setDescription(testObj.description || '');
    setDuration(testObj.duration || 15);
    setQuestions(testObj.questions || []);
    setWizardStep(1);
    setActiveTab('createTest');
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setDuration(15);
    setQuestions([]);
    setEditingTestId(null);
    setWizardStep(1);
  };

  // Step 1 -> Step 2
  const handleProceedToQuestions = () => {
    if (!title.trim() || !subject.trim()) {
      alert('Please enter Test Title & Subject!');
      return;
    }
    setWizardStep(2);
  };

  // Add / Update Single Question
  const handleAddQuestion = () => {
    if (!qText.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim() || !opt4.trim()) {
      alert('Please fill question text and all 4 options!');
      return;
    }

    if (editQId !== null) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editQId
            ? {
                ...q,
                questionText: qText,
                options: [opt1, opt2, opt3, opt4],
                correctOption: parseInt(correctOption),
                marks: parseInt(marks) || 1
              }
            : q
        )
      );
      setEditQId(null);
    } else {
      const newQ = {
        id: Date.now() + Math.random(),
        questionText: qText,
        options: [opt1, opt2, opt3, opt4],
        correctOption: parseInt(correctOption),
        marks: parseInt(marks) || 1
      };
      setQuestions((prev) => [...prev, newQ]);
    }

    setQText('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setCorrectOption(0);
    setMarks(5);
  };

  const handleEditQuestion = (q) => {
    setEditQId(q.id);
    setQText(q.questionText);
    setOpt1(q.options[0]);
    setOpt2(q.options[1]);
    setOpt3(q.options[2]);
    setOpt4(q.options[3]);
    setCorrectOption(q.correctOption);
    setMarks(q.marks);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleProceedToPreview = () => {
    let currentQuestionsList = [...questions];

    if (qText.trim() && opt1.trim() && opt2.trim() && opt3.trim() && opt4.trim()) {
      const pendingQ = {
        id: Date.now() + Math.random(),
        questionText: qText,
        options: [opt1, opt2, opt3, opt4],
        correctOption: parseInt(correctOption),
        marks: parseInt(marks) || 1
      };
      currentQuestionsList.push(pendingQ);
      setQuestions(currentQuestionsList);
      setQText('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setOpt4('');
      setCorrectOption(0);
      setMarks(5);
    }

    if (currentQuestionsList.length === 0) {
      alert('Please add at least 1 question to the test!');
      return;
    }

    setWizardStep(3);
  };

  // Final Save / Publish
  const handleSaveTest = (status) => {
    const finalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    if (editingTestId) {
      setTests((prev) =>
        prev.map((t) =>
          t.id === editingTestId
            ? {
                ...t,
                title,
                subject,
                description: description || 'Comprehensive assessment',
                duration: parseInt(duration),
                totalMarks: finalMarks,
                status,
                questions: [...questions]
              }
            : t
        )
      );
      alert(`🎉 Test updated and saved as ${status.toUpperCase()}!`);
    } else {
      const newTest = {
        id: Date.now(),
        teacherId: user.id,
        teacherName: user.name,
        title,
        subject,
        description: description || 'Comprehensive assessment',
        duration: parseInt(duration),
        totalMarks: finalMarks,
        status,
        questions: [...questions]
      };
      setTests([newTest, ...tests]);
      alert(`🎉 Test saved as ${status.toUpperCase()} successfully!`);
    }

    resetForm();
    setActiveTab('dashboard');
  };

  const handleDeleteTest = (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      setTests(tests.filter((t) => t.id !== testId));
    }
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '28px 32px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
    marginBottom: '24px',
    boxSizing: 'border-box'
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '6px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', width: '100%' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1.5px solid #e2e8f0',
          padding: '14px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            📝
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Online Test Management</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{user.name}</span>
            <span
              style={{
                background: '#ede9fe',
                color: '#4338ca',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800',
                border: '1px solid #c7d2fe'
              }}
            >
              Teacher
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '800',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            background: '#ffffff',
            borderRight: '1.5px solid #e2e8f0',
            padding: '28px 18px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.8px',
              marginBottom: '14px',
              paddingLeft: '12px'
            }}
          >
            Teacher Panel
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'dashboard' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '13px 18px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: activeTab === 'dashboard' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              🏠 Dashboard
            </button>

            <button
              onClick={() => {
                resetForm();
                setActiveTab('createTest');
              }}
              style={{
                background: activeTab === 'createTest' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'createTest' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '13px 18px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: activeTab === 'createTest' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              ✏️ Create Test
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              style={{
                background: activeTab === 'activity' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'activity' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '13px 18px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: activeTab === 'activity' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              📊 Student Progress
            </button>
          </nav>
        </aside>

        {/* Dashboard Workspace */}
        <main style={{ flex: 1, padding: '36px 44px', boxSizing: 'border-box', overflowY: 'auto' }}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  padding: '30px 36px',
                  borderRadius: '22px',
                  marginBottom: '30px',
                  boxShadow: '0 12px 28px rgba(79, 70, 229, 0.22)'
                }}
              >
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>Welcome back, {user.name} 👋</h1>
                <p style={{ fontSize: '14px', margin: 0, opacity: 0.95 }}>
                  Manage tests, review drafts, and monitor student submissions.
                </p>
              </div>

              {/* 3 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px', marginBottom: '34px' }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Created Tests</div>
                      <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{myCreatedTests.length}</div>
                    </div>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📚</div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Published</div>
                      <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{publishedCount}</div>
                    </div>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🚀</div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Drafts</div>
                      <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{draftCount}</div>
                    </div>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💾</div>
                  </div>
                </div>
              </div>

              {/* My Tests Table */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Tests ({myCreatedTests.length})</h2>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('createTest');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)'
                    }}
                  >
                    + Create New Test
                  </button>
                </div>

                {myCreatedTests.length === 0 ? (
                  <p style={{ color: '#64748b', margin: 0, padding: '20px 0', textAlign: 'center' }}>
                    You haven't created any tests yet. Click "+ Create New Test" to get started.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Test Title</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Questions</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Duration</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCreatedTests.map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 18px', fontWeight: '700', color: '#0f172a' }}>{t.title}</td>
                            <td style={{ padding: '16px 18px', color: '#4f46e5', fontWeight: '600' }}>{t.subject}</td>
                            <td style={{ padding: '16px 18px', color: '#475569' }}>{t.questions.length} Qs</td>
                            <td style={{ padding: '16px 18px', color: '#475569' }}>{t.duration} mins</td>
                            <td style={{ padding: '16px 18px' }}>
                              <span
                                style={{
                                  background: t.status === 'published' ? '#ede9fe' : '#fef3c7',
                                  color: t.status === 'published' ? '#4338ca' : '#b45309',
                                  padding: '5px 12px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '800'
                                }}
                              >
                                {t.status.toUpperCase()}
                              </span>
                            </td>
                            
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                {t.status === 'draft' && (
                                  <button
                                    onClick={() => handleDirectPublish(t.id, t.title)}
                                    title="Publish this test"
                                    style={{
                                      background: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '7px 14px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                                    }}
                                  >
                                    🚀 Publish
                                  </button>
                                )}

                                <button
                                  onClick={() => handleEditDraftTest(t)}
                                  title="Edit Test / Questions"
                                  style={{
                                    background: '#f8fafc',
                                    color: '#475569',
                                    border: '1.5px solid #e2e8f0',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  onClick={() => handleDeleteTest(t.id, t.title)}
                                  title="Delete Test"
                                  style={{
                                    background: '#fff1f2',
                                    color: '#e11d48',
                                    border: '1.5px solid #fecdd3',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / EDIT TEST WIZARD */}
          {activeTab === 'createTest' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {editingTestId ? 'Edit Draft Test' : 'Create Examination'}
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Fill information, add multiple-choice questions, and publish to students.
                </p>
              </div>

              {/* Stepper Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  padding: '16px 28px',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  marginBottom: '24px'
                }}
              >
                <div
                  onClick={() => setWizardStep(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    color: wizardStep === 1 ? '#4f46e5' : wizardStep > 1 ? '#10b981' : '#94a3b8',
                    fontWeight: '800',
                    fontSize: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: wizardStep === 1 ? '#4f46e5' : wizardStep > 1 ? '#10b981' : '#f1f5f9',
                      color: wizardStep >= 1 ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    {wizardStep > 1 ? '✓' : '1'}
                  </div>
                  <span>Test Information</span>
                </div>

                <div style={{ flex: 1, height: '2px', background: '#e2e8f0', margin: '0 16px' }} />

                <div
                  onClick={() => { if (title && subject) setWizardStep(2); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: title && subject ? 'pointer' : 'not-allowed',
                    color: wizardStep === 2 ? '#4f46e5' : wizardStep > 2 ? '#10b981' : '#94a3b8',
                    fontWeight: '800',
                    fontSize: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: wizardStep === 2 ? '#4f46e5' : wizardStep > 2 ? '#10b981' : '#f1f5f9',
                      color: wizardStep >= 2 ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    {wizardStep > 2 ? '✓' : '2'}
                  </div>
                  <span>Questions ({questions.length})</span>
                </div>

                <div style={{ flex: 1, height: '2px', background: '#e2e8f0', margin: '0 16px' }} />

                <div
                  onClick={handleProceedToPreview}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    color: wizardStep === 3 ? '#4f46e5' : '#94a3b8',
                    fontWeight: '800',
                    fontSize: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: wizardStep === 3 ? '#4f46e5' : '#f1f5f9',
                      color: wizardStep === 3 ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    3
                  </div>
                  <span>Preview & Publish</span>
                </div>
              </div>

              {/* STEP 1: TEST DETAILS */}
              {wizardStep === 1 && (
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>
                    1. Basic Test Details
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                    <div>
                      <label style={labelStyle}>Test Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. React.js Fundamentals"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subject *</label>
                      <input
                        type="text"
                        placeholder="e.g. Web Development"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={labelStyle}>Test Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Comprehensive core subject questions"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration (Minutes)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleProceedToQuestions}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)'
                      }}
                    >
                      Next: Add Questions →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: QUESTIONS BUILDER */}
              {wizardStep === 2 && (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {editQId ? '✏️ Edit Question' : '2. Add Questions'}
                    </h3>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '800' }}>
                      Questions Added: {questions.length}
                    </span>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={labelStyle}>Question Statement *</label>
                    <input
                      type="text"
                      placeholder="e.g. What hook is used for side-effects in React?"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={labelStyle}>Option A *</label>
                      <input type="text" placeholder="Option A text" value={opt1} onChange={(e) => setOpt1(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Option B *</label>
                      <input type="text" placeholder="Option B text" value={opt2} onChange={(e) => setOpt2(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Option C *</label>
                      <input type="text" placeholder="Option C text" value={opt3} onChange={(e) => setOpt3(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Option D *</label>
                      <input type="text" placeholder="Option D text" value={opt4} onChange={(e) => setOpt4(e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Select Correct Option</label>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        style={inputStyle}
                      >
                        <option value={0}>Option A is Correct</option>
                        <option value={1}>Option B is Correct</option>
                        <option value={2}>Option C is Correct</option>
                        <option value={3}>Option D is Correct</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Marks for this Question</label>
                      <input
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddQuestion}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {editQId ? '💾 Update Question' : '➕ Save & Add This Question'}
                  </button>

                  {/* Configured Questions Table (✨ Clean Inline-Aligned & No Wrap ✨) */}
                  {questions.length > 0 && (
                    <div style={{ marginTop: '28px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                        Questions in Test ({questions.length})
                      </h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', width: '60px' }}>#</th>
                              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Question</th>
                              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Marks</th>
                              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', width: '150px', whiteSpace: 'nowrap' }}>Correct Option</th>
                              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', width: '130px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questions.map((q, idx) => (
                              <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>Q{idx + 1}</td>
                                <td style={{ padding: '14px 16px', color: '#1e293b', lineHeight: 1.4 }}>{q.questionText}</td>
                                
                                {/* Single Line Marks Pill */}
                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                                    {q.marks} <span style={{ fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Marks</span>
                                  </span>
                                </td>

                                {/* Single Line Option Badge */}
                                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                  <span
                                    style={{
                                      background: '#ede9fe',
                                      color: '#4338ca',
                                      padding: '6px 14px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      border: '1px solid #c7d2fe',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    Option {String.fromCharCode(65 + q.correctOption)}
                                  </span>
                                </td>

                                {/* Compact Row Actions */}
                                <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                      onClick={() => handleEditQuestion(q)}
                                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(q.id)}
                                      style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button
                      onClick={() => setWizardStep(1)}
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      ← Back to Test Info
                    </button>
                    <button
                      onClick={handleProceedToPreview}
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)' }}
                    >
                      Next: Preview & Publish →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PREVIEW & PUBLISH */}
              {wizardStep === 3 && (
                <div>
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>TEST PREVIEW</span>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800' }}>Draft</span>
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>{title}</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>{description || 'Comprehensive test'}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#f8fafc', padding: '18px 22px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Subject</div>
                        <div style={{ fontWeight: '800', fontSize: '15px', marginTop: '4px', color: '#0f172a' }}>{subject}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Duration</div>
                        <div style={{ fontWeight: '800', fontSize: '15px', marginTop: '4px', color: '#0f172a' }}>{duration} mins</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Questions</div>
                        <div style={{ fontWeight: '800', fontSize: '15px', marginTop: '4px', color: '#0f172a' }}>{questions.length} Qs</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Marks</div>
                        <div style={{ fontWeight: '800', fontSize: '15px', marginTop: '4px', color: '#4f46e5' }}>{totalCalculatedMarks} Marks</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setWizardStep(1)}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Edit Test Info
                      </button>
                      <button
                        onClick={() => setWizardStep(2)}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Edit Questions
                      </button>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Questions ({questions.length})</h3>
                      <span style={{ fontWeight: '800', color: '#4f46e5', fontSize: '14px' }}>Total Marks: {totalCalculatedMarks}</span>
                    </div>

                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '20px 24px',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            Q{idx + 1}. {q.questionText}
                          </h4>
                          <span style={{ background: '#ede9fe', color: '#4338ca', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800' }}>
                            {q.marks} Marks
                          </span>
                        </div>

                        <div>
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: optIdx === q.correctOption ? '#ecfdf5' : '#ffffff',
                                border: optIdx === q.correctOption ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                color: optIdx === q.correctOption ? '#065f46' : '#1e293b',
                                fontWeight: optIdx === q.correctOption ? '700' : '500',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '8px',
                                fontSize: '14px'
                              }}
                            >
                              <span>
                                <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                              </span>
                              {optIdx === q.correctOption && <span style={{ color: '#059669', fontWeight: '800' }}>✓ Correct Answer</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '30px' }}>
                      <button
                        onClick={() => handleSaveTest('draft')}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        💾 Save as Draft
                      </button>
                      <button
                        onClick={() => handleSaveTest('published')}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '12px 26px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)' }}
                      >
                        🚀 Publish Test
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENT SUBMISSIONS */}
          {activeTab === 'activity' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Student Submissions</h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Review all student attempts and scores on tests created by you ({user.name}).
                </p>
              </div>

              <div style={cardStyle}>
                {myTestResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No students have submitted your tests yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Student Name</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Test & Subject</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Timing</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Questions (Att./Unatt.)</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Score</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Percentage</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myTestResults.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 18px', fontWeight: '700', color: '#0f172a' }}>{r.studentName}</td>
                            <td style={{ padding: '16px 18px' }}>
                              <strong>{r.testName}</strong>
                              <br />
                              <span style={{ color: '#4f46e5', fontSize: '12px', fontWeight: '600' }}>{r.subject}</span>
                            </td>
                            <td style={{ padding: '16px 18px', color: '#475569', fontSize: '13px' }}>
                              {r.startTime} - {r.endTime}
                            </td>
                            <td style={{ padding: '16px 18px', fontSize: '13px' }}>
                              Total: {r.totalQuestions} ({r.attempted}/{r.unanswered})
                            </td>
                            <td style={{ padding: '16px 18px', fontWeight: '800', color: '#0f172a' }}>
                              {r.marksObtained} / {r.totalMarks}
                            </td>
                            <td style={{ padding: '16px 18px', fontWeight: '800', color: '#4f46e5' }}>{r.percentage}%</td>
                            <td style={{ padding: '16px 18px' }}>
                              <span
                                style={{
                                  background: r.status === 'Pass' ? '#dcfce7' : '#fee2e2',
                                  color: r.status === 'Pass' ? '#15803d' : '#991b1b',
                                  padding: '5px 12px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '800'
                                }}
                              >
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}