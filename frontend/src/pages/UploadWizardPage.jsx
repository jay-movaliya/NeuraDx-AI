import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, ArrowRight, Check, User, Stethoscope, Upload,
  Eye, Activity, FileText, Phone, Mail, MapPin, Calendar,
  Droplet, Weight, Ruler, Brain, Sparkles, ChevronRight,
  AlertCircle, CheckCircle, Shield, Clock, Zap, X
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultsViewer from '../components/ResultsViewer';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { scanAPI } from '../services/api';

/* ─────────────────────────────────────────────────────────── */
/*  STEP CONFIG                                                 */
/* ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 1, key: 'basic',   name: 'Patient Info',     icon: User,
    color: '#3A8BFF', grad: 'from-blue-500 to-blue-600',
    desc: 'Patient identification and contact details',
    tip: 'Accurate patient info ensures correct record matching and faster diagnosis.'
  },
  {
    id: 2, key: 'upload',  name: 'Upload Scan',      icon: Upload,
    color: '#22d3ee', grad: 'from-cyan-400 to-blue-500',
    desc: 'Upload the medical image',
    tip: 'High-resolution DICOM or standard image files yield the best AI results.'
  },
  {
    id: 3, key: 'review',  name: 'Review',            icon: Eye,
    color: '#34d399', grad: 'from-emerald-400 to-teal-500',
    desc: 'Verify before analysis',
    tip: 'Double-check all details before we run the AI analysis pipeline.'
  },
  {
    id: 4, key: 'results', name: 'AI Results',        icon: Activity,
    color: '#fbbf24', grad: 'from-amber-400 to-orange-500',
    desc: 'Real-time AI diagnosis',
    tip: 'NeuraDx AI achieves 97.1% accuracy on brain MRI classification.'
  },
];

/* ─────────────────────────────────────────────────────────── */
/*  SUB-COMPONENTS                                             */
/* ─────────────────────────────────────────────────────────── */

/** Floating-label text input */
const FloatInput = ({ label, id, icon: Icon, suffix, type = 'text', placeholder, reg, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color .2s' }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        borderRadius: 14,
        border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: focused ? (error ? '0 0 0 3px var(--danger-bg)' : '0 0 0 3px var(--accent-soft)') : 'none',
        transition: 'border-color .2s, box-shadow .2s',
        overflow: 'hidden',
      }}>
        {Icon && (
          <Icon size={15}
            color={focused ? 'var(--accent)' : 'var(--text-faint)'}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color .2s', pointerEvents: 'none', zIndex: 1 }}
          />
        )}
        <input
          id={id} type={type}
          {...reg}
          placeholder={placeholder}
          onFocus={e => { setFocused(true); reg?.onFocus?.(e); }}
          onBlur={e => { setFocused(false); reg?.onBlur?.(e); }}
          onChange={e => { reg?.onChange?.(e); }}
          style={{
            width: '100%',
            padding: `13px ${suffix ? 44 : 16}px 13px ${Icon ? 42 : 16}px`,
            background: focused ? 'var(--bg-input-focus)' : 'var(--bg-input)',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            transition: 'background .2s',
          }}
          {...props}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', userSelect: 'none', zIndex: 1 }}>{suffix}</span>
        )}
      </div>
      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--danger)' }}>
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
};

/** FloatSelect */
const FloatSelect = ({ label, id, icon: Icon, reg, children, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color .2s' }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        borderRadius: 14,
        border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: focused ? '0 0 0 3px var(--accent-soft)' : 'none',
        transition: 'border-color .2s, box-shadow .2s',
        overflow: 'hidden',
      }}>
        {Icon && <Icon size={15} color={focused ? 'var(--accent)' : 'var(--text-faint)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />}
        <select
          id={id} {...reg}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `13px 36px 13px ${Icon ? 42 : 16}px`,
            background: focused ? 'var(--bg-input-focus)' : 'var(--bg-input)',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'background .2s',
          }}
        >
          {children}
        </select>
        <ChevronRight size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', zIndex: 1 }} />
      </div>
    </div>
  );
};

/** FloatTextarea */
const FloatTextarea = ({ label, id, reg, placeholder, rows = 3, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: focused ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color .2s' }}>
        {label}
      </label>
      <textarea
        id={id} rows={rows} {...reg} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: focused ? 'var(--bg-input-focus)' : 'var(--bg-input)',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 14, padding: '13px 16px', fontSize: 14,
          color: 'var(--text-primary)', outline: 'none', resize: 'none',
          fontFamily: 'inherit', lineHeight: 1.65,
          boxShadow: focused ? '0 0 0 3px var(--accent-soft)' : 'none',
          transition: 'border-color .2s, box-shadow .2s, background .2s',
          width: '100%',
        }}
      />
      {hint && <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{hint}</p>}
    </div>
  );
};

/** Review item */
const RItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-muted)' }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: value ? 'var(--text-primary)' : 'var(--text-faint)', fontStyle: value ? 'normal' : 'italic', maxWidth: '55%', textAlign: 'right' }}>
      {value || 'Not provided'}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                   */
/* ─────────────────────────────────────────────────────────── */
const UploadWizardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const { uploadedImage, isProcessing, results, analyzeImage } = useImageAnalysis();
  const formRef = useRef(null);

  const { register, watch, formState: { errors } } = useForm({
    defaultValues: {
      patientName: '',
      patientId: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      scanType: 'MRI',
    }
  });
  const fd = watch();

  const current = STEPS[step - 1];
  const next = () => { if (step < 4) { setStep(s => s + 1); formRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }};
  const back = () => { if (step > 1) { setStep(s => s - 1); formRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }};
  const cantContinue = (step === 2 && !uploadedImage) || (step === 2 && isProcessing) || (step === 3 && !results);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOPBAR ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', background: 'var(--bg-nav)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <motion.button whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          <ArrowLeft size={17} /> Dashboard
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mini step pills */}
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              width: step === s.id ? 28 : 8, height: 8, borderRadius: 99,
              background: step > s.id ? s.color : step === s.id ? s.color : 'var(--border)',
              opacity: step > s.id ? 0.6 : 1,
              transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{step}/4 — {current.name}</span>
          <ThemeToggle size="sm" />
        </div>
      </motion.div>

      {/* ── MAIN 2-COLUMN LAYOUT ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 0 }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
          display: 'flex', flexDirection: 'column',
          background: isDark
            ? 'linear-gradient(160deg,#020b18 0%,#0a1f44 40%,#0d2a5e 70%,#071730 100%)'
            : 'linear-gradient(160deg,#e8f0fe 0%,#dbeafe 40%,#eff6ff 75%,#e0ecff 100%)',
          padding: '32px 24px',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#3A8BFF,#4B83F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px #3A8BFF55' }}>
              <Brain size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>NeuraDx AI</div>
              <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)', marginTop: -1 }}>MEDICAL IMAGING</div>
            </div>
          </div>

          {/* Steps list */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Workflow Steps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STEPS.map((s, i) => {
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 14,
                      background: active ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(58,139,255,0.12)') : 'transparent',
                      border: active ? (isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(58,139,255,0.3)') : '1px solid transparent',
                      cursor: 'default', transition: 'all 0.3s',
                    }}
                  >
                    {/* Step icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: done ? s.color : active ? `${s.color}30` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'),
                      border: done ? 'none' : active ? `1.5px solid ${s.color}` : (isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(15,23,42,0.12)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: active ? `0 0 16px ${s.color}55` : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {done
                        ? <Check size={16} color="#fff" strokeWidth={3} />
                        : <s.icon size={16} color={active ? s.color : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.3)')} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? (isDark ? '#fff' : '#0f172a') : done ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.6)') : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.3)'), transition: 'color 0.3s' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)', marginTop: 1 }}>{s.desc}</div>
                    </div>
                    {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Tip card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              style={{
                marginTop: 24, padding: '16px', borderRadius: 16,
                background: `linear-gradient(135deg,${current.color}22,${current.color}10)`,
                border: `1px solid ${current.color}40`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={13} color={current.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: current.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Tip</span>
              </div>
              <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.65)', lineHeight: 1.6, margin: 0 }}>{current.tip}</p>
            </motion.div>
          </AnimatePresence>

          {/* Feature pills */}
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { icon: Shield, text: 'HIPAA Secure' },
              { icon: Zap, text: 'Instant AI' },
              { icon: Clock, text: '< 30s Analysis' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(58,139,255,0.08)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(58,139,255,0.2)' }}>
                <f.icon size={11} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.45)'} />
                <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.5)', fontWeight: 600 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ──────────────────────────────────── */}
        <div ref={formRef} style={{ overflowY: 'auto', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel, var(--bg-base))' }}>
          <div style={{ flex: 1, padding: '36px 48px 120px' }}>

            {/* Step heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`heading-${step}`}
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 32 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `linear-gradient(135deg,${current.color},${current.color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 24px ${current.color}44`,
                  }}>
                    <current.icon size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: current.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                      Step {step} of 5
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                      {current.name === 'Patient Info' ? 'Basic Information' : current.name === 'Clinical Data' ? 'Medical Details' : current.name}
                    </h1>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, paddingLeft: 62 }}>{current.desc}</p>
                <div style={{ height: 2, borderRadius: 99, marginTop: 20, background: `linear-gradient(90deg,${current.color},transparent)` }} />
              </motion.div>
            </AnimatePresence>

            {/* ── STEP CONTENT ─────────────────────────────────── */}
            <AnimatePresence mode="wait">

              {/* ── Step 1: Basic Info ─── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <FloatInput label="Patient Name *" id="patientName" icon={User} placeholder="John Doe"
                        reg={register('patientName', { required: 'Patient name is required' })} error={errors.patientName?.message} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <FloatInput label="Patient ID *" id="patientId" icon={User} placeholder="PID-12345"
                        reg={register('patientId', { required: 'Patient ID is required' })} error={errors.patientId?.message} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <FloatInput label="Age *" id="age" icon={Calendar} type="number" placeholder="45"
                        reg={register('age', { required: 'Age is required', min: 1, max: 150 })} error={errors.age?.message} />
                    </div>
                    <FloatSelect label="Gender *" id="gender" reg={register('gender', { required: 'Gender is required' })} error={errors.gender?.message}>
                      <option value="">Select gender…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </FloatSelect>
                    <FloatSelect label="Scan Type *" id="scanType" icon={Activity} reg={register('scanType', { required: 'Scan type is required' })} error={errors.scanType?.message}>
    
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                    </FloatSelect>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <FloatInput label="Phone Number *" id="phone" icon={Phone} type="tel" placeholder="+1 234 567 8900"
                        reg={register('phone', { required: 'Phone number is required' })} error={errors.phone?.message} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <FloatInput label="Email Address *" id="email" icon={Mail} type="email" placeholder="patient@email.com"
                        reg={register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} error={errors.email?.message} />
                    </div>
                  </div>

                  {/* Required note */}
                  <div style={{
                    marginTop: 28, padding: '14px 18px', borderRadius: 14,
                    background: 'var(--accent-soft)', border: '1px solid var(--border-focus)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Sparkles size={14} color="var(--accent)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      All fields are required to continue with the scan upload.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Upload ─── */}
              {step === 2 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  {/* Patient banner */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    borderRadius: 14, marginBottom: 24,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    backdropFilter: 'blur(16px)',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#22d3ee,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {fd.patientName || 'Patient Name'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {fd.age ? `${fd.age} yrs` : '—'} • {fd.gender || '—'} • {fd.scanType}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 9, background: 'var(--cyan-bg)', border: '1px solid var(--cyan-border)', fontSize: 11, fontWeight: 700, color: 'var(--cyan)' }}>
                      Ready to upload
                    </div>
                  </div>

                  <ImageUploader onImageUpload={(f, p) => analyzeImage(f, p, fd)} isProcessing={isProcessing} />

                  {/* Tips row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 24 }}>
                    {[
                      { icon: '📁', t: 'Formats', d: 'JPEG · PNG · DICOM · TIFF' },
                      { icon: '📐', t: 'Resolution', d: 'Min 512 × 512 px' },
                      { icon: '🔒', t: 'Security', d: 'End-to-end encrypted' },
                    ].map(x => (
                      <div key={x.t} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{x.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{x.t}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{x.d}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review ─── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 20 }}>
                    {/* Patient card */}
                    <div style={{ padding: '20px', borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: '#3A8BFF20', border: '1px solid #3A8BFF40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} color="#3A8BFF" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Patient Information</span>
                      </div>
                      <RItem label="Name"    value={fd.patientName} />
                      <RItem label="Patient ID" value={fd.patientId} />
                      <RItem label="Age"     value={fd.age ? `${fd.age} years` : null} />
                      <RItem label="Gender"  value={fd.gender} />
                      <RItem label="Phone"   value={fd.phone} />
                      <RItem label="Email"   value={fd.email} />
                      <RItem label="Scan Type" value={fd.scanType} />
                    </div>
                  </div>

                  {/* Scan preview */}
                  {uploadedImage && (
                    <div style={{ padding: '20px', borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: '#22d3ee20', border: '1px solid #22d3ee40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Upload size={14} color="#22d3ee" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Uploaded Scan</span>
                        <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 8, background: 'var(--success-bg)', border: '1px solid var(--success-border)', fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>✓ Ready</div>
                      </div>
                      <img src={uploadedImage} alt="Scan" style={{ width: '100%', maxWidth: 320, borderRadius: 14, border: '1px solid var(--border)', margin: '0 auto', display: 'block' }} />
                    </div>
                  )}

                  {/* AI notice */}
                  <div style={{
                    padding: '18px 20px', borderRadius: 16,
                    background: 'linear-gradient(135deg,rgba(58,139,255,.12),rgba(75,131,246,.08))',
                    border: '1px solid rgba(58,139,255,.3)',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#3A8BFF,#4B83F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px #3A8BFF55' }}>
                      <Brain size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Ready for AI Analysis</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        NeuraDx AI will analyze this scan for anomalies, generate confidence scores, and produce a structured diagnostic report in under 30 seconds.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Results ─── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  {results ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        style={{ textAlign: 'center', marginBottom: 28 }}
                      >
                        <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--success-bg)', border: '2px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(52,211,153,.25)' }}>
                          <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Analysis Complete!</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                          {fd.patientName} • {fd.scanType}
                        </p>
                      </motion.div>
                      <ResultsViewer 
                        image={uploadedImage} 
                        detections={results.detections} 
                        confidence={results.confidence / 100}
                        annotatedImage={results.annotated_image}
                      />
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                        <motion.button
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 0 40px var(--accent-glow)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            try {
                              await scanAPI.downloadReport(results.scan_id);
                              alert('Report downloaded successfully!');
                            } catch (error) {
                              alert('Failed to download report');
                            }
                          }}
                          style={{ padding: '16px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: 'var(--shadow-glow)' }}
                        >
                          <FileText size={18} /> Download Report
                        </motion.button>
                        
                        <motion.button
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            const email = fd.email || prompt('Enter email address to send report:');
                            if (email) {
                              try {
                                await scanAPI.emailReport(results.scan_id, email);
                                alert(`Report sent to ${email} successfully!`);
                              } catch (error) {
                                alert('Failed to send email');
                              }
                            }
                          }}
                          style={{ padding: '16px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '2px solid var(--border)', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        >
                          <Mail size={18} /> Email Report
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--accent-soft)', border: '1px solid var(--border-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Upload size={28} color="var(--accent)" />
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No Scan Uploaded</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Go back to Step 2 to upload a medical scan image first.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── BOTTOM NAV BAR — sticky inside scroll panel ───────── */}
          {step < 4 && (
            <div style={{
              position: 'sticky', bottom: 0,
              padding: '16px 48px',
              background: 'var(--bg-nav)', backdropFilter: 'blur(24px)',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              zIndex: 10,
            }}>
              <motion.button
                whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}
                onClick={back} disabled={step === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px', background: 'var(--bg-card)',
                  color: step === 1 ? 'var(--text-faint)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)', borderRadius: 14,
                  fontWeight: 700, fontSize: 14, cursor: step === 1 ? 'not-allowed' : 'pointer',
                  opacity: step === 1 ? 0.45 : 1, backdropFilter: 'blur(16px)',
                }}
              >
                <ArrowLeft size={16} /> Back
              </motion.button>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {STEPS.map(s => (
                  <div key={s.id} style={{
                    height: 8, borderRadius: 99,
                    width: step === s.id ? 28 : 8,
                    background: step > s.id ? s.color : step === s.id ? current.color : 'var(--border)',
                    opacity: step > s.id ? 0.5 : 1,
                    transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                ))}
              </div>

              <motion.button
                whileHover={!cantContinue ? { x: 4, boxShadow: `0 0 32px ${current.color}77` } : {}}
                whileTap={!cantContinue ? { scale: 0.96 } : {}}
                onClick={next} disabled={cantContinue}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 26px',
                  background: cantContinue ? 'var(--border)' : `linear-gradient(135deg,${current.color},${current.color}bb)`,
                  color: cantContinue ? 'var(--text-faint)' : '#fff',
                  border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14,
                  cursor: cantContinue ? 'not-allowed' : 'pointer',
                  boxShadow: cantContinue ? 'none' : `0 6px 24px ${current.color}55`,
                  transition: 'all 0.3s',
                }}
              >
                {step === 3 ? 'Start AI Analysis' : 'Continue'} <ArrowRight size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadWizardPage;
