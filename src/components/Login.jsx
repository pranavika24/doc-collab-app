import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, requires2FA } = useAuth();

  if (requires2FA) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          if (signInError === '2FA_REQUIRED') {
            return;
          }
          setError(signInError.message || 'Invalid email or password');
        }
      } else {
        const { error: signUpError } = await signUp(email, password, username);
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }
    setLoading(false);
  };

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
      maxWidth: '1200px',
      width: '100%'
    },
    card: {
      background: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      border: '1px solid #f1f5f9'
    },
    ksitHeader: {
      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      borderRadius: '1rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    teamMember: {
      background: '#dbeafe',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      textAlign: 'center',
      border: '1px solid #bfdbfe'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '1rem'
    },
    button: {
      width: '100%',
      background: '#2563eb',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    spinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          @media (min-width: 1024px) {
            .login-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}
      </style>

      <div style={{...styles.grid, className: 'login-grid'}}>
        {/* Left Side - Project Info */}
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={styles.ksitHeader}>
              <h1 style={{color: 'white', fontSize: '1.875rem', fontWeight: '700', margin: 0}}>
                K.S. Institute of Technology
              </h1>
            </div>
            <h2 style={{color: '#374151', fontSize: '1.25rem', fontWeight: '600', margin: '0.5rem 0'}}>
              Department of Computer Science & Engineering
            </h2>
            <div style={{width: '6rem', height: '2px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', margin: '1rem auto', borderRadius: '1px'}}></div>
          </div>

          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h3 style={{color: '#1f2937', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
              Cloud-Based Document Collaboration System
            </h3>
            <p style={{color: '#6b7280'}}>Real-time collaborative document editing with version control</p>
          </div>

          {/* Team Members */}
          <div style={{marginBottom: '2rem'}}>
            <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#374151', textAlign: 'center', marginBottom: '1rem'}}>
              Project Team
            </h4>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
              {[
                { name: 'NAVYA P', usn: '1KS23CS092' },
                { name: 'NISARGA N', usn: '1KS23CS096' },
                { name: 'PRANAVIKA M', usn: '1KS23CS112' },
                { name: 'PUNEETH S V', usn: '1KS24CS408' }
              ].map((member, index) => (
                <div key={index} style={styles.teamMember}>
                  <div style={{fontWeight: '600', color: '#1f2937'}}>{member.name}</div>
                  <div style={{fontSize: '0.875rem', color: '#2563eb', fontFamily: 'monospace'}}>{member.usn}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guide Info */}
          <div style={{background: '#fef3c7', borderRadius: '0.75rem', padding: '1rem', borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem'}}>
            <h4 style={{fontWeight: '700', color: '#92400e', margin: 0}}>Project Guide</h4>
            <p style={{fontWeight: '600', color: '#92400e', margin: '0.25rem 0'}}>Vishvakiran</p>
            <p style={{fontSize: '0.875rem', color: '#92400e', margin: 0}}>Department of CSE</p>
          </div>

          {/* Features */}
          <div>
            <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#374151', textAlign: 'center', marginBottom: '1rem'}}>
              Key Features
            </h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {[
                'Real-time multi-user editing',
                'Role-based access control',
                'Version history',
                'Secure cloud storage',
                'File upload support',
                'Two-Factor Authentication'
              ].map((feature, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', background: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem'}}>
                  <span style={{color: '#10b981', marginRight: '0.5rem'}}>✓</span>
                  <span style={{color: '#374151'}}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem'}}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{color: '#6b7280'}}>
              {isLogin ? 'Sign in to your account' : 'Join our collaboration platform'}
            </p>
          </div>

          {error && (
            <div style={{background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem'}}>
              <p style={{color: '#dc2626', margin: 0}}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {!isLogin && (
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={styles.spinner}></div>
                  <span style={{marginLeft: '0.5rem'}}>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;