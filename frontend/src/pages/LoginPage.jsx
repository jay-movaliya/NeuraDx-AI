import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert(data.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Connection error. Please make sure the backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Theme toggle — top right corner */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 1100, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* Left — Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'none', ...(window.innerWidth >= 1024 ? { display: 'block' } : {}) }}
            className="left-panel"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}>
                <Activity size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>NeuraDx AI</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Medical Imaging Platform</p>
              </div>
            </div>

            <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 16 }}>
              Welcome Back to<br />
              <span className="text-gradient">Advanced Diagnostics</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>
              Continue your journey in AI-powered medical imaging analysis with precision and confidence.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                { icon: Zap, title: 'Instant AI Analysis', desc: 'Get results in seconds', color: 'var(--accent)' },
                { icon: Shield, title: 'HIPAA Compliant', desc: 'Your data is secure', color: 'var(--success)' },
              ].map((f, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
                padding: '24px', borderRadius: 20,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              }}
            >
              {[['50K+','Scans'],['2.5K+','Users'],['99.2%','Accuracy']].map(([v,l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Login form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            {/* Mobile logo */}
            <div style={{ display: 'none', textAlign: 'center', marginBottom: 32 }} className="mobile-logo">
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
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 28, padding: '40px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sign In</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="t-input" style={{ paddingLeft: 46 }}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="t-input" style={{ paddingLeft: 46, paddingRight: 46 }}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--accent)', borderRadius: 4 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text-link)', fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 36px var(--accent-glow)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '15px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                    color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  ) : (
                    <><span>Sign In</span><ArrowRight size={18} /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ position: 'relative', margin: '28px 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ padding: '0 16px', background: 'var(--bg-card)', fontSize: 13, color: 'var(--text-muted)' }}>or</span>
                </div>
              </div>

              {/* Register link */}
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--text-link)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
              </p>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 20 }}>
              © 2024 NeuraDx AI • Secure Medical Platform
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
