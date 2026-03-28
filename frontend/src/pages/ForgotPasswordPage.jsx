import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Connection error. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
              <Activity size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>NeuraDx AI</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>Medical Imaging</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 28, padding: '40px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)' }}
        >
          {!isSuccess ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Forgot Password?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  No worries, we'll send you reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="t-input"
                      style={{ paddingLeft: 46 }}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 36px var(--accent-glow)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 16,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </form>

              {/* Back to login */}
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 24,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--success), #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle size={40} color="#fff" />
                </div>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: 12 }}>
                Check Your Email
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
                We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                }}
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          )}
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 20 }}>
          © 2024 NeuraDx AI • Secure Medical Platform
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
