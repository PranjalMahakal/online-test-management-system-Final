import React, { useState, useEffect } from 'react';
import dummyData from './data/dummyData.json';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [tests, setTests] = useState(() => {
    const saved = localStorage.getItem('tests');
    return saved ? JSON.parse(saved) : dummyData.initialTests;
  });

  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('results');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('results', JSON.stringify(results));
  }, [results]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        users={dummyData.users}
        tests={tests}
        results={results}
        setTests={setTests}
        onLogout={handleLogout}
      />
    );
  }

  if (currentUser.role === 'teacher') {
    return (
      <TeacherDashboard
        user={currentUser}
        tests={tests}
        setTests={setTests}
        results={results}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <StudentDashboard
      user={currentUser}
      tests={tests}
      results={results}
      setResults={setResults}
      onLogout={handleLogout}
    />
  );
}