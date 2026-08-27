import React, { useState } from 'react';
import dummyData from '../data/dummyData.json';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = dummyData.users.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Invalid email or password! Please check again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            padding: '38px 24px',
            textAlign: 'center',
            color: '#ffffff'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(5px)',
              borderRadius: '16px',
              margin: '0 auto 14px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px'
            }}
          >
            📝
          </div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: '1.3'
            }}
          >
            Online Test Management
            <br />
            System
          </h2>
        </div>

        {/* Form Body */}
        <div style={{ padding: '34px 32px 30px 32px', boxSizing: 'border-box' }}>
          <h3
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 6px 0'
            }}
          >
            Welcome Back!
          </h3>
          <p
            style={{
              color: '#64748b',
              fontSize: '13px',
              margin: '0 0 24px 0'
            }}
          >
            Login to continue to your dashboard
          </p>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '18px',
                border: '1px solid #fecaca'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Email Field */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '8px'
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-email"
                required
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: '14px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '8px'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px 44px 13px 16px',
                    fontSize: '14px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '800',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Login
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '12px',
              marginTop: '22px',
              marginBottom: 0
            }}
          >
            Use your registered email and password
          </p>
        </div>
      </div>
    </div>
  );
}