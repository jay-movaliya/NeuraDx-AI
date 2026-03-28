import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, Building, Eye, EyeOff, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', hospital: '', password: '', confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          hospital: formData.hospital,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert(data.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Connection error. Please make sure the backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Zap,           text: 'AI-powered tumor detection',   color: '#3A8BFF' },
    { icon: Shield,        text: 'HIPAA compliant platform',      color: '#10b981' },
    { icon: CheckCircle2,  text: 'Real-time analysis results',    color: '#4B83F6' },
  ];

  /* Shared input style */
  const inp = (extra = {}) => ({
    width: '100%', padding: '12px 14px 12px 46px',
    background: 'var(--bg-input)', border: '2px solid var(--border)',
    borderRadius: 14, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
    ...extra,
  });

  return (
    <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 1100, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* Left — Branding */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
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

            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 14 }}>
              Join the Future of<br />
              <span className="text-gradient">Medical Imaging</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
              Empower your practice with AI-assisted tumor detection and analysis. Join thousands of medical professionals.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {features.map((f, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={20} color={f.color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ padding: '22px', borderRadius: 20, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: 'var(--shadow-glow)' }}
            >
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
                "NeuraDx AI has transformed how we analyze medical images. The accuracy and speed are remarkable."
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>— Dr. Sarah Johnson, Radiologist</p>
            </motion.div>
          </motion.div>

          {/* Right — Register form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 28, padding: '36px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Create Account</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Join our medical imaging platform</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inp()} placeholder="Dr. John Smith" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inp()} placeholder="doctor@hospital.com" />
                  </div>
                </div>

                {/* Hospital */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Hospital/Clinic</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={17} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" required value={formData.hospital} onChange={e => setFormData({ ...formData, hospital: e.target.value })} style={inp()} placeholder="City Hospital" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inp({ paddingRight: 44 })} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} style={inp()} placeholder="••••••••" />
                  </div>
                </div>

                {/* Terms */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input type="checkbox" required style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    I agree to the{' '}
                    <a href="#" style={{ color: 'var(--text-link)', fontWeight: 700, textDecoration: 'none' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" style={{ color: 'var(--text-link)', fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>
                  </span>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 36px var(--accent-glow)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '15px',
                    background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
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
                    <><span>Create Account</span><ArrowRight size={18} /></>
                  )}
                </motion.button>
              </form>

              {/* Login link */}
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 24, marginBottom: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--text-link)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
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

export default RegisterPage;
