import React, { useState, useMemo } from 'react';

export default function AdminDashboard({ user, users = [], tests = [], results = [], setTests, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Modals & Inspection States
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inspectingTest, setInspectingTest] = useState(null);
  const [inspectingSubmission, setInspectingSubmission] = useState(null);

  // Filters for Master Logs
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterTeacher, setFilterTeacher] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract lists
  const teacherList = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);
  const studentList = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  // Total calculations
  const totalTeachers = teacherList.length;
  const totalStudents = studentList.length;
  const totalTests = tests.length;
  const publishedTestsCount = tests.filter((t) => t.status === 'published').length;
  const draftTestsCount = tests.filter((t) => t.status === 'draft').length;
  const totalSubmissions = results.length;
  const totalPassed = results.filter((r) => r.status === 'Pass').length;
  const overallPassingRate = totalSubmissions > 0 ? ((totalPassed / totalSubmissions) * 100).toFixed(1) : '0.0';

  // Helper to resolve teacher for a test
  const getTeacherForTest = (testObj) => {
    if (!testObj) return 'Pranali Jadhav';
    if (testObj.teacherName) return testObj.teacherName;
    if (testObj.teacherId) {
      const teacher = users.find((u) => u.id === testObj.teacherId);
      if (teacher) return teacher.name;
    }
    return 'Faculty / Teacher';
  };

  // Helper to resolve teacher for a submission result
  const getTeacherForResult = (resultObj) => {
    const matchedTest = tests.find(
      (t) => t.id === resultObj.testId || t.title === resultObj.testName
    );
    if (matchedTest) return getTeacherForTest(matchedTest);
    return 'Faculty / Teacher';
  };

  // Unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set();
    tests.forEach((t) => t.subject && subjects.add(t.subject));
    results.forEach((r) => r.subject && subjects.add(r.subject));
    return Array.from(subjects);
  }, [tests, results]);

  // Unique teachers for filter
  const uniqueTeacherNames = useMemo(() => {
    return teacherList.map((t) => t.name);
  }, [teacherList]);

  // Filtered Master Logs
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Subject filter
      if (filterSubject !== 'ALL' && r.subject !== filterSubject) return false;

      // Status filter
      if (filterStatus !== 'ALL' && r.status.toLowerCase() !== filterStatus.toLowerCase()) return false;

      // Teacher filter
      if (filterTeacher !== 'ALL') {
        const creatorName = getTeacherForResult(r);
        if (creatorName !== filterTeacher) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentMatch = r.studentName && r.studentName.toLowerCase().includes(q);
        const testMatch = r.testName && r.testName.toLowerCase().includes(q);
        const subjectMatch = r.subject && r.subject.toLowerCase().includes(q);
        if (!studentMatch && !testMatch && !subjectMatch) return false;
      }

      return true;
    });
  }, [results, filterSubject, filterStatus, filterTeacher, searchQuery, tests, users]);

  // Toggle publish status by admin (optional super-admin authority)
  const handleToggleTestPublish = (testId) => {
    if (!setTests) return;
    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? { ...t, status: t.status === 'published' ? 'draft' : 'published' }
          : t
      )
    );
  };

  // Reusable Indigo Theme Styles
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '26px 30px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
    marginBottom: '24px',
    boxSizing: 'border-box'
  };

  const badgeStyle = (type) => {
    switch (type) {
      case 'published':
      case 'pass':
        return {
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        };
      case 'draft':
      case 'warning':
        return {
          background: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fde68a',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        };
      case 'fail':
      case 'danger':
        return {
          background: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        };
      case 'indigo':
      default:
        return {
          background: '#ede9fe',
          color: '#4338ca',
          border: '1px solid #c7d2fe',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', width: '100%', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* 1. Top Navbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Online Test Management System
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', marginTop: '2px' }}>
              Principal & Super Admin Central Hub
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              padding: '6px 14px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '14px'
              }}
            >
              👑
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>{user.name}</div>
              <span
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '800',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}
              >
                Super Admin
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1.5px solid #fecaca',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: '800',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#991b1b';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <aside
          style={{
            width: '270px',
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
            Principal Control Panel
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                background: activeTab === 'overview' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'overview' ? '#ffffff' : '#64748b',
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
                boxShadow: activeTab === 'overview' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>🏠</span>
              <span>Overview / Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              style={{
                background: activeTab === 'teachers' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'teachers' ? '#ffffff' : '#64748b',
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
                boxShadow: activeTab === 'teachers' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>👨‍🏫</span>
              <span>Teacher Monitoring</span>
              <span
                style={{
                  marginLeft: 'auto',
                  background: activeTab === 'teachers' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === 'teachers' ? '#ffffff' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}
              >
                {totalTeachers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              style={{
                background: activeTab === 'students' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'students' ? '#ffffff' : '#64748b',
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
                boxShadow: activeTab === 'students' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>🎓</span>
              <span>Student Performance</span>
              <span
                style={{
                  marginLeft: 'auto',
                  background: activeTab === 'students' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === 'students' ? '#ffffff' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}
              >
                {totalStudents}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              style={{
                background: activeTab === 'submissions' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                color: activeTab === 'submissions' ? '#ffffff' : '#64748b',
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
                boxShadow: activeTab === 'submissions' ? '0 8px 18px rgba(79, 70, 229, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>📊</span>
              <span>Master Submissions</span>
              <span
                style={{
                  marginLeft: 'auto',
                  background: activeTab === 'submissions' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === 'submissions' ? '#ffffff' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}
              >
                {totalSubmissions}
              </span>
            </button>
          </nav>

          {/* Quick System Status Card at bottom of sidebar */}
          <div
            style={{
              marginTop: 'auto',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#15803d' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              System Live & Healthy
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0 0' }}>
              Full institutional oversight active
            </p>
          </div>
        </aside>

        {/* 3. Main Workspace */}
        <main style={{ flex: 1, padding: '36px 44px', boxSizing: 'border-box', overflowY: 'auto' }}>
          {/* TAB 1: 🏠 OVERVIEW / ANALYTICS */}
          {activeTab === 'overview' && (
            <div>
              {/* Welcome Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  color: '#ffffff',
                  padding: '32px 38px',
                  borderRadius: '22px',
                  marginBottom: '32px',
                  boxShadow: '0 12px 28px rgba(79, 70, 229, 0.22)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', marginBottom: '10px' }}>
                    ✨ Executive Principal Dashboard
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>
                    Welcome, {user.name} 🎓
                  </h1>
                  <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
                    Complete administrative oversight of faculty assessments, student performance metrics, and submission logs.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    style={{
                      background: '#ffffff',
                      color: '#4f46e5',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    View All Logs →
                  </button>
                </div>
              </div>

              {/* 4 Live KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {/* Card 1: Teachers */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Registered Teachers
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                        {totalTeachers}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '700', marginTop: '4px' }}>
                        Active Faculty Members
                      </div>
                    </div>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#ede9fe', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                      👨‍🏫
                    </div>
                  </div>
                </div>

                {/* Card 2: Students */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Registered Students
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                        {totalStudents}
                      </div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
                        Enrolled Candidates
                      </div>
                    </div>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                      🎓
                    </div>
                  </div>
                </div>

                {/* Card 3: Total Tests (Drafts vs Published) */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Total Tests Created
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                        {totalTests}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>
                        <span style={{ color: '#15803d', fontWeight: '800' }}>{publishedTestsCount} Live</span> • <span style={{ color: '#b45309', fontWeight: '800' }}>{draftTestsCount} Drafts</span>
                      </div>
                    </div>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                      📚
                    </div>
                  </div>
                </div>

                {/* Card 4: Submissions & Passing % */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Attempts & Pass %
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                        {totalSubmissions} <span style={{ fontSize: '18px', color: '#64748b', fontWeight: '600' }}>({overallPassingRate}%)</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', marginTop: '4px' }}>
                        {totalPassed} Passed • {totalSubmissions - totalPassed} Failed
                      </div>
                    </div>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                      📈
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Activity Feeds (Two Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left Feed: Recent Tests Created */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📝</span>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Recent Tests Created
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('teachers')}
                      style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                    >
                      View Faculty Tests →
                    </button>
                  </div>

                  {tests.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No tests created yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tests.slice(0, 4).map((test) => (
                        <div
                          key={test.id}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{test.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                              Subject: <strong style={{ color: '#4f46e5' }}>{test.subject}</strong> | By: <strong>{getTeacherForTest(test)}</strong>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              ⏱️ {test.duration} mins • 📋 {test.questions ? test.questions.length : 0} Questions
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={badgeStyle(test.status)}>
                              {test.status.toUpperCase()}
                            </span>
                            <div style={{ marginTop: '8px' }}>
                              <button
                                onClick={() => setInspectingTest(test)}
                                style={{
                                  background: '#ffffff',
                                  border: '1.5px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                View Qs 🔍
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Feed: Latest Student Submissions */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>⚡</span>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Latest Student Submissions
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Master Table →
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>⏳</div>
                      <div style={{ fontWeight: '700' }}>No submissions recorded yet</div>
                      <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>When students attempt tests, results will show live here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {results.slice(0, 4).map((res) => (
                        <div
                          key={res.id}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{res.studentName}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                              Test: <strong>{res.testName}</strong> ({res.subject})
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              Timing: {res.startTime} - {res.endTime}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: res.status === 'Pass' ? '#15803d' : '#991b1b' }}>
                              {res.marksObtained}/{res.totalMarks} ({res.percentage}%)
                            </div>
                            <div style={{ marginTop: '6px' }}>
                              <span style={badgeStyle(res.status === 'Pass' ? 'pass' : 'fail')}>
                                {res.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 👨‍🏫 TEACHER MONITORING */}
          {activeTab === 'teachers' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                    Faculty & Teacher Oversight
                  </h1>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Monitor all teachers, created tests, drafts, and examine the tests authored by each teacher.
                  </p>
                </div>
                <div style={{ background: '#ede9fe', color: '#4338ca', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '14px' }}>
                  Total Teachers: {totalTeachers}
                </div>
              </div>

              {/* Teachers Table Card */}
              <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Teacher Name</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Email Address</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Total Tests</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Published Tests</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Draft Tests</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Student Submissions</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherList.map((teacher) => {
                        const teacherTests = tests.filter((t) => t.teacherId === teacher.id || t.teacherName === teacher.name);
                        const publishedTests = teacherTests.filter((t) => t.status === 'published');
                        const draftTests = teacherTests.filter((t) => t.status === 'draft');
                        const teacherSubmissions = results.filter((r) =>
                          teacherTests.some((t) => t.id === r.testId || t.title === r.testName)
                        );

                        return (
                          <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '12px',
                                    background: '#e0e7ff',
                                    color: '#4338ca',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                  }}
                                >
                                  {teacher.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{teacher.name}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Faculty ID: #{teacher.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 18px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                              {teacher.email}
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{teacherTests.length}</span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                                {publishedTests.length} Live
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                                {draftTests.length} Drafts
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ fontWeight: '800', color: '#4f46e5', fontSize: '14px' }}>
                                {teacherSubmissions.length} Attempts
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedTeacher({ teacher, tests: teacherTests, submissions: teacherSubmissions })}
                                style={{
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                🔍 View Tests ({teacherTests.length})
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 🎓 STUDENT MONITORING & PERFORMANCE */}
          {activeTab === 'students' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                    Student Directory & Performance Analytics
                  </h1>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Monitor student test attempts, pass/fail ratios, average percentages, and examine comprehensive individual scorecards.
                  </p>
                </div>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '14px' }}>
                  Total Students: {totalStudents}
                </div>
              </div>

              {/* Students Table Card */}
              <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Student Name</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Email Address</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Tests Attempted</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Passed</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Failed</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Average Score %</th>
                        <th style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentList.map((student) => {
                        const studentSubmissions = results.filter((r) => r.studentId === student.id || r.studentName === student.name);
                        const passedCount = studentSubmissions.filter((r) => r.status === 'Pass').length;
                        const failedCount = studentSubmissions.filter((r) => r.status === 'Fail').length;
                        const avgPct = studentSubmissions.length > 0
                          ? (studentSubmissions.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / studentSubmissions.length).toFixed(1)
                          : '0.0';

                        return (
                          <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '12px',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                  }}
                                >
                                  {student.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{student.name}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>Student ID: #{student.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 18px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                              {student.email}
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{studentSubmissions.length}</span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                                {passedCount} Pass
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ background: failedCount > 0 ? '#fee2e2' : '#f1f5f9', color: failedCount > 0 ? '#991b1b' : '#64748b', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                                {failedCount} Fail
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '800', fontSize: '15px', color: '#4f46e5' }}>{avgPct}%</span>
                                {studentSubmissions.length > 0 && (
                                  <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, Math.max(0, parseFloat(avgPct)))}%`, height: '100%', background: parseFloat(avgPct) >= 40 ? '#10b981' : '#ef4444' }} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedStudent({ student, submissions: studentSubmissions, avgPct, passedCount, failedCount })}
                                style={{
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                📄 Inspect Scorecard
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 📊 MASTER TEST SUBMISSIONS / LOGS */}
          {activeTab === 'submissions' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  Master Test Submissions & Institutional Logs
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Complete, searchable audit trail of every student test attempt across all teachers and subjects.
                </p>
              </div>

              {/* Filters & Search Toolbar */}
              <div
                style={{
                  ...cardStyle,
                  padding: '20px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {/* Search Bar */}
                <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    🔍 Search Student or Test
                  </label>
                  <input
                    type="text"
                    placeholder="Search by student, test name, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Subject Filter */}
                <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    📚 Subject
                  </label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="ALL">All Subjects</option>
                    {uniqueSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Teacher Filter */}
                <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    👨‍🏫 Faculty
                  </label>
                  <select
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="ALL">All Teachers</option>
                    {uniqueTeacherNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div style={{ flex: '0 1 140px', minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    🎯 Result Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="Pass">Pass Only</option>
                    <option value="Fail">Fail Only</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(filterSubject !== 'ALL' || filterTeacher !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => {
                        setFilterSubject('ALL');
                        setFilterTeacher('ALL');
                        setFilterStatus('ALL');
                        setSearchQuery('');
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1.5px solid #cbd5e1',
                        padding: '9px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Master Table Card */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>
                    Submissions Log ({filteredResults.length} records found)
                  </div>
                </div>

                {filteredResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>No matching submissions found</div>
                    <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
                      {results.length === 0 ? 'No student has completed any tests yet.' : 'Try clearing your filters or search query.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Student</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Test & Subject</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Created By (Teacher)</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Timestamps</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Questions</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Score</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Percentage</th>
                          <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((r) => {
                          const teacherName = getTeacherForResult(r);
                          return (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{r.studentName}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>ID: #{r.studentId || 'N/A'}</div>
                              </td>

                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{r.testName}</div>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', marginTop: '3px', display: 'inline-block' }}>
                                  {r.subject}
                                </span>
                              </td>

                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '700', color: '#334155', fontSize: '13px' }}>👨‍🏫 {teacherName}</div>
                              </td>

                              <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                                <div><strong>Start:</strong> {r.startTime}</div>
                                <div><strong>End:</strong> {r.endTime}</div>
                              </td>

                              <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                                <div><strong style={{ color: '#0f172a' }}>{r.attempted}</strong> att. / <span style={{ color: '#ef4444' }}>{r.unanswered} skip</span></div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Total: {r.totalQuestions} Qs</div>
                              </td>

                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                                  {r.marksObtained}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '13px' }}> / {r.totalMarks}</span>
                              </td>

                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px', color: '#4f46e5' }}>
                                  {r.percentage}%
                                </span>
                              </td>

                              <td style={{ padding: '14px 16px' }}>
                                <span style={badgeStyle(r.status === 'Pass' ? 'pass' : 'fail')}>
                                  {r.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: TEACHER TESTS INSPECTION */}
      {selectedTeacher && (
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
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '800px',
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
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ede9fe', color: '#4338ca', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', marginBottom: '8px' }}>
                  FACULTY TEST REPOSITORY
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {selectedTeacher.teacher.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Email: {selectedTeacher.teacher.email} • ID: #{selectedTeacher.teacher.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '800', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Teacher Test Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Authored</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedTeacher.tests.length} Tests</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Published Live</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>
                  {selectedTeacher.tests.filter((t) => t.status === 'published').length}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Student Attempts</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>{selectedTeacher.submissions.length}</div>
              </div>
            </div>

            {/* List of Tests */}
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Created Examinations ({selectedTeacher.tests.length})
            </h3>

            {selectedTeacher.tests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '14px' }}>
                This teacher has not created any tests yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedTeacher.tests.map((test) => (
                  <div
                    key={test.id}
                    style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{test.title}</span>
                          <span style={badgeStyle(test.status)}>{test.status.toUpperCase()}</span>
                        </div>
                        <div style={{ color: '#4f46e5', fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>
                          Subject: {test.subject}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                          {test.description || 'Standard Assessment'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            handleToggleTestPublish(test.id);
                            setSelectedTeacher((prev) => ({
                              ...prev,
                              tests: prev.tests.map((t) =>
                                t.id === test.id
                                  ? { ...t, status: t.status === 'published' ? 'draft' : 'published' }
                                  : t
                              )
                            }));
                          }}
                          style={{
                            background: test.status === 'published' ? '#fef3c7' : '#dcfce7',
                            color: test.status === 'published' ? '#b45309' : '#15803d',
                            border: '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {test.status === 'published' ? 'Set Draft' : 'Publish Live'}
                        </button>
                        <button
                          onClick={() => setInspectingTest(test)}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          Questions ({test.questions ? test.questions.length : 0}) 🔍
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                      <span>⏱️ Duration: <strong>{test.duration} mins</strong></span>
                      <span>🎯 Total Marks: <strong>{test.questions ? test.questions.reduce((sum, q) => sum + (q.marks || 1), 0) : 0}</strong></span>
                      <span>📋 Questions: <strong>{test.questions ? test.questions.length : 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedTeacher(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT SCORECARD INSPECTION */}
      {selectedStudent && (
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
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '850px',
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
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', marginBottom: '8px' }}>
                  STUDENT PERFORMANCE DOSSIER
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {selectedStudent.student.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Email: {selectedStudent.student.email} • Student ID: #{selectedStudent.student.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '800', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Performance KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Tests Taken</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedStudent.submissions.length}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Passed Tests</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>{selectedStudent.passedCount}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Failed Tests</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: selectedStudent.failedCount > 0 ? '#991b1b' : '#64748b', marginTop: '4px' }}>
                  {selectedStudent.failedCount}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Average Score</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>{selectedStudent.avgPct}%</div>
              </div>
            </div>

            {/* Test Attempts List */}
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Submission History & Breakdown
            </h3>

            {selectedStudent.submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '14px' }}>
                This student has not attempted any tests yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Test Title</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Timing</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Questions</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Score</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Percentage</th>
                      <th style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.submissions.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{sub.testName}</td>
                        <td style={{ padding: '12px 14px', color: '#4f46e5', fontWeight: '700' }}>{sub.subject}</td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#475569' }}>
                          {sub.startTime} - {sub.endTime}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                          {sub.attempted} att. / {sub.unanswered} skip
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>
                          {sub.marksObtained}/{sub.totalMarks}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#4f46e5' }}>
                          {sub.percentage}%
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={badgeStyle(sub.status === 'Pass' ? 'pass' : 'fail')}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TEST QUESTIONS INSPECTOR */}
      {inspectingTest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setInspectingTest(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '750px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '18px', marginBottom: '20px' }}>
              <div>
                <span style={badgeStyle(inspectingTest.status)}>{inspectingTest.status.toUpperCase()}</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px 0' }}>
                  {inspectingTest.title}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Subject: <strong style={{ color: '#4f46e5' }}>{inspectingTest.subject}</strong> | Created By: <strong>{getTeacherForTest(inspectingTest)}</strong> | Duration: {inspectingTest.duration} mins
                </p>
              </div>
              <button
                onClick={() => setInspectingTest(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '800', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Questions List ({inspectingTest.questions ? inspectingTest.questions.length : 0})
            </h3>

            {!inspectingTest.questions || inspectingTest.questions.length === 0 ? (
              <p style={{ color: '#64748b' }}>No questions configured in this test.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inspectingTest.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                        Q{idx + 1}. {q.questionText}
                      </span>
                      <span style={{ background: '#ede9fe', color: '#4338ca', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' }}>
                        {q.marks || 1} Marks
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {q.options && q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: optIdx === q.correctOption ? '#ecfdf5' : '#ffffff',
                            border: optIdx === q.correctOption ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            color: optIdx === q.correctOption ? '#065f46' : '#334155',
                            fontWeight: optIdx === q.correctOption ? '700' : '500',
                            fontSize: '13px'
                          }}
                        >
                          <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt} {optIdx === q.correctOption && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setInspectingTest(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
