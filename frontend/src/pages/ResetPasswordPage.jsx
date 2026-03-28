import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Connection error. Please make sure the backend is running.');
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
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Reset Password</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  Enter your new password below
                </p>
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: '#fee', border: '1px solid #fcc', borderRadius: 12, marginBottom: 20, fontSize: 14, color: '#c33' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="t-input"
                      style={{ paddingLeft: 46, paddingRight: 46 }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="t-input"
                      style={{ paddingLeft: 46, paddingRight: 46 }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading || !token}
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
                    cursor: isLoading || !token ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !token ? 0.7 : 1,
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
                    'Reset Password'
                  )}
                </motion.button>
              </form>
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
                Password Reset Successfully
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
                Your password has been reset. You will be redirected to the login page in a few seconds.
              </p>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                Go to Login
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

export default ResetPasswordPage;
