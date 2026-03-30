import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineTicket } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { user, role, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === 'agent') navigate('/agent');
      else navigate('/dashboard');
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential'  ? 'Invalid email or password.'   :
        err.code === 'auth/too-many-requests'    ? 'Too many attempts. Try later.' :
        'Login failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2563eb, #06b6d4, #2563eb)' }} />
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '45%', height: '45%', background: 'rgba(219,234,254,0.6)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '45%', height: '45%', background: 'rgba(207,250,254,0.5)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }} className="animate-fade-in">
        {/* Card — using inline styles to guarantee correct padding, unaffected by .premium-card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
          padding: '3rem',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: 72, height: 72, background: '#2563eb',
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', boxShadow: '0 20px 40px -10px rgba(37,99,235,0.4)',
            }}>
              <HiOutlineTicket size={36} color="#fff" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>TicketFlow</h1>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.35em', marginTop: 10 }}>Management Console</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '1.5rem', padding: '0.875rem 1rem',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, color: '#dc2626',
              fontSize: 12, fontWeight: 700, textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="login-email" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Access Email
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@ticketflow.com"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 52, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                    fontSize: 14, fontWeight: 500, color: '#0f172a',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="login-password" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Security Key
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 52, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                    fontSize: 14, fontWeight: 500, color: '#0f172a',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 56,
                background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 14, cursor: 'pointer',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                boxShadow: '0 20px 40px -10px rgba(37,99,235,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                marginTop: '0.5rem',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#1d4ed8'; }}
              onMouseLeave={e => { e.target.style.background = '#2563eb'; }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>

          <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            &copy; 2026 TicketFlow Systems
          </p>
        </div>
      </div>
    </div>
  );
}