import { useRef, Suspense, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Stars, OrbitControls, ContactShadows } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Shield, Zap, Activity, ArrowRight, CheckCircle,
  Target, BarChart2, Clock, ChevronDown, Menu, X
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import * as THREE from 'three';


/* ── Pre-load the GLB ────────────────────────────────────────────────────── */
useGLTF.preload('/brain.glb');

/* ── Glowy Brain Model ───────────────────────────────────────────────────── */
function BrainModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/brain.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color:             new THREE.Color('#0af0ff'),
          emissive:          new THREE.Color('#0077ff'),
          emissiveIntensity: 1.8,
          roughness:         0.45,
          metalness:         0.05,
          toneMapped:        false,
        });
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.14;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]}    intensity={3.0}  color="#ffffff" />
      <directionalLight position={[-5, 3, -4]}  intensity={1.5}  color="#88ccff" />
      <pointLight position={[0, 4, 3]}   intensity={20}  color="#00bbff" distance={12} decay={2} />
      <pointLight position={[-3,-2, 2]}  intensity={10}  color="#0040ff" distance={9}  decay={2} />
      <pointLight position={[3, -1,-2]}  intensity={8}   color="#00ffcc" distance={8}  decay={2} />
      <pointLight position={[0,  0, 4]}  intensity={12}  color="#00eeff" distance={10} decay={2} />

      <Float speed={1.0} rotationIntensity={0.08} floatIntensity={0.6}>
        <group ref={groupRef} scale={[1.3, 1.3, 1.3]}>
          <primitive object={scene} />
        </group>
      </Float>
    </group>
  );
}

/* ── Neural Network animation (neurons firing) ─────────────────────────── */
const NODE_POS = [
  [2.2, 1.0, 0.5], [-2.0, 1.2, -0.3], [0.3, 2.4, 0.8], [1.8, -1.0, 1.0],
  [-1.5, -1.3, 0.7], [0.0, 0.0, 2.2], [2.5, 0.2, -0.8], [-2.3, 0.0, 0.5],
  [0.5, -2.2, -0.5], [-0.8, 1.8, -1.5], [1.2, 1.5, -1.8], [-0.3, -0.5, -2.4],
];
const CONN = [
  [0, 2], [0, 5], [0, 6], [1, 2], [1, 7], [1, 4], [2, 5], [2, 10],
  [3, 5], [3, 4], [3, 6], [4, 7], [5, 8], [5, 11], [6, 10], [7, 8],
  [8, 11], [9, 10], [9, 11], [9, 1], [10, 11],
];

function NeuralNetwork() {
  const signals = useRef(CONN.map(() => ({ t: Math.random(), speed: 0.2 + Math.random() * 0.25 })));
  const meshRefs = useRef([]);

  useFrame((_, delta) => {
    signals.current.forEach((s, i) => {
      s.t = (s.t + delta * s.speed) % 1;
      const [a, b] = CONN[i];
      const ax = NODE_POS[a][0], ay = NODE_POS[a][1], az = NODE_POS[a][2];
      const bx = NODE_POS[b][0], by = NODE_POS[b][1], bz = NODE_POS[b][2];
      if (meshRefs.current[i]) {
        meshRefs.current[i].position.set(
          ax + (bx - ax) * s.t,
          ay + (by - ay) * s.t,
          az + (bz - az) * s.t,
        );
      }
    });
  });

  return (
    <group>
      {/* Glowing nodes */}
      {NODE_POS.map((p, i) => (
        <mesh key={`n${i}`} position={p}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial color="#00cfff" toneMapped={false} />
        </mesh>
      ))}

      {/* Connection lines */}
      {CONN.map(([a, b], i) => {
        const pts = [new THREE.Vector3(...NODE_POS[a]), new THREE.Vector3(...NODE_POS[b])];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={`l${i}`} geometry={geo}>
            <lineBasicMaterial color="#0088dd" transparent opacity={0.3} />
          </line>
        );
      })}

      {/* Traveling signal dots */}
      {CONN.map((_, i) => (
        <mesh key={`s${i}`} ref={el => meshRefs.current[i] = el}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshBasicMaterial color="#00eeff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <Suspense fallback={null}>
      <BrainModel />
      <NeuralNetwork />
    </Suspense>
  );
}


/* ── Stat counter ──────────────────────────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ──────────────────────────────────────────────────────────── */
const features = [
  { icon: Brain, color: '#3A8BFF', title: 'AI Brain Analysis', desc: 'Deep learning models trained on 500K+ scans detect tumors with 97.1% accuracy.' },
  { icon: Zap, color: '#4B83F6', title: 'Instant Results', desc: 'Get comprehensive diagnostic reports in under 30 seconds, 24/7.' },
  // { icon: Shield, color: '#10b981', title: 'HIPAA Compliant', desc: 'End-to-end encryption ensures complete patient data privacy and security.' },
  { icon: Target, color: '#f59e0b', title: 'Precision Detection', desc: 'Sub-millimeter detection of anomalies with bounding-box localization.' },
  { icon: BarChart2, color: '#06b6d4', title: 'Rich Reports', desc: 'Auto-generated clinical PDF reports with annotated scan images.' },
  { icon: Activity, color: '#a78bfa', title: 'Multi-Modality', desc: 'Supports MRI, CT, X-Ray, and DICOM file formats seamlessly.' },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Scans Analyzed' },
  { value: 97, suffix: '.1%', label: 'Accuracy' },
  { value: 2500, suffix: '+', label: 'Physicians' },
  { value: 30, suffix: 's', label: 'Avg Report Time' },
];

/* ── MAIN COMPONENT ───────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef();
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -80]);

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 0%, #0d1b3e 0%, #060d20 45%, #030810 100%)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden', color: '#e2eaff', position: 'relative' }}>

      {/* ── FULL-PAGE STAR BACKGROUND ──────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: false, alpha: true }}>
          <Stars radius={120} depth={60} count={3500} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
        {/* Subtle nebula glows for depth */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(30,80,200,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,150,255,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
      </div>

      {/* All content sits above the star bg with position:relative */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: 'rgba(3,8,16,0.85)', backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(58,139,255,0.15)',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg,#3A8BFF,#4B83F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(58,139,255,0.5)' }}
              >
                <Brain size={20} color="#fff" />
              </motion.div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#e2eaff', letterSpacing: '-0.4px' }}>NeuraDx <span style={{ color: '#3A8BFF' }}>AI</span></div>
                <div style={{ fontSize: 9, color: '#7ab3ff', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: -2 }}>Medical Imaging</div>
              </div>
            </div>

            {/* Nav links — desktop */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-desktop">
              {['Features', 'About', 'Accuracy'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{l}</a>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(58,139,255,0.25)', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#c8d8ff', cursor: 'pointer' }}
              >Sign In</motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px var(--accent-glow)' }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#3A8BFF,#4B83F6)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 0 20px rgba(58,139,255,0.45)' }}
              >Get Started</motion.button>
              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#c8d8ff', marginLeft: 4 }} className="mobile-menu-btn">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ background: 'var(--bg-nav)', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['Features', 'About', 'Accuracy'].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                      style={{ fontSize: 15, fontWeight: 600, color: '#c8d8ff', textDecoration: 'none' }}>{l}</a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section ref={heroRef} style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: 1280, margin: '0 auto', padding: '140px 28px 60px', gap: 40 }}>

          {/* Left text */}
          <motion.div style={{ opacity: heroOpacity, y: heroY }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(58,139,255,0.12)', border: '1px solid rgba(58,139,255,0.35)', borderRadius: 30, marginBottom: 24 }}
            >
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3A8BFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI-Powered Diagnostics</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#f0f5ff', lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 20px' }}
            >
              Medical Imaging<br />
              <span className="text-gradient">Reimagined</span><br />
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 17, color: '#8babd4', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}
            >
              NeuraDx AI detects brain tumors, anomalies, and critical conditions in seconds — giving physicians the clarity to act faster and save lives.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px var(--accent-glow)' }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'linear-gradient(135deg,#3A8BFF,#1a5fff)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 0 36px rgba(58,139,255,0.5)' }}
              >
                Start Free <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(58,139,255,0.3)', borderRadius: 16, fontSize: 16, fontWeight: 700, color: '#c8d8ff', cursor: 'pointer', backdropFilter: 'blur(16px)' }}
              >
                Sign In
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            {/* <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 36 }}
            >
              {[{ icon: Shield, text: 'HIPAA Secure' }, { icon: CheckCircle, text: '97.1% Accuracy' }, { icon: Clock, text: '<30s Reports' }].map(b => (
                <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <b.icon size={14} color="#3A8BFF" />
                  <span style={{ fontSize: 12, color: '#7ab3ff', fontWeight: 600 }}>{b.text}</span>
                </div>
              ))}
            </motion.div> */}
          </motion.div>

          {/* Right — 3D panel + stat chips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ position: 'relative', height: 520 }}
          >

            {/* Canvas wrapper — CSS glow applied here so it works with transparent bg */}
            <div style={{
              position: 'absolute', inset: 0,
              filter: 'drop-shadow(0 0 22px rgba(0,180,255,0.95)) drop-shadow(0 0 55px rgba(0,100,255,0.6)) drop-shadow(0 0 90px rgba(0,60,255,0.35))',
            }}>
              <Canvas
                camera={{ position: [0, 0.2, 7.5], fov: 55 }}
                style={{ width: '100%', height: '100%', background: 'transparent' }}
                gl={{ antialias: true, alpha: true }}
                onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
              >
                <Scene />
              </Canvas>
            </div>





          </motion.div>
        </section>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingBottom: 48, opacity: 0.5 }}
        >
          <span style={{ fontSize: 11, color: '#3a5a8a', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll to explore</span>
          <ChevronDown size={18} color="#3a5a8a" />
        </motion.div>

        {/* ── STATS BAR ────────────────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg,#1a3a8f 0%,#0d2260 50%,#091a50 100%)', padding: '48px 28px', borderTop: '1px solid rgba(58,139,255,0.2)', borderBottom: '1px solid rgba(58,139,255,0.2)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section id="features" style={{ padding: '100px 28px', maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', background: 'rgba(58,139,255,0.12)', border: '1px solid rgba(58,139,255,0.35)', borderRadius: 30, fontSize: 11, fontWeight: 700, color: '#3A8BFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Platform Features
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#f0f5ff', margin: '0 0 16px', letterSpacing: '-1px' }}>
              Everything You Need in <span className="text-gradient">One Place</span>
            </h2>
            <p style={{ fontSize: 17, color: '#8babd4', maxWidth: 560, margin: '0 auto' }}>
              From upload to detailed clinical report — NeuraDx handles the entire diagnostic workflow with precision AI.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{ background: 'rgba(10,20,50,0.7)', border: '1px solid rgba(58,139,255,0.15)', borderRadius: 22, padding: '28px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 30px rgba(0,20,80,0.4)', cursor: 'default', transition: 'border-color 0.3s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${f.color}55`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Glow blob */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: f.color, borderRadius: '50%', filter: 'blur(44px)', opacity: 0.12, pointerEvents: 'none' }} />
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e2eaff', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#7a9abf', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="about" style={{ padding: '80px 28px', background: 'rgba(4,10,26,0.8)', borderTop: '1px solid rgba(58,139,255,0.1)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ display: 'inline-block', padding: '5px 16px', background: 'rgba(58,139,255,0.12)', border: '1px solid rgba(58,139,255,0.35)', borderRadius: 30, fontSize: 11, fontWeight: 700, color: '#3A8BFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>How It Works</div>
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#f0f5ff', margin: '0 0 56px', letterSpacing: '-1px' }}>
                From Upload to Diagnosis in <span className="text-gradient">3 Steps</span>
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {[
                { step: '01', icon: Activity, color: '#3A8BFF', title: 'Upload Scan', desc: 'Upload MRI, CT, or X-Ray in any standard format.' },
                { step: '02', icon: Brain, color: '#4B83F6', title: 'AI Analysis', desc: 'Our AI model processes and annotates the image instantly.' },
                { step: '03', icon: BarChart2, color: '#10b981', title: 'Get Report', desc: 'Download a detailed PDF report with findings & recommendations.' },
              ].map((s, i) => (
                <motion.div key={s.step}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  style={{ background: 'rgba(10,20,50,0.7)', border: '1px solid rgba(58,139,255,0.15)', borderRadius: 22, padding: '32px 24px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 30px rgba(0,20,80,0.35)', textAlign: 'center' }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: '0.12em', marginBottom: 16 }}>STEP {s.step}</div>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <s.icon size={26} color={s.color} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e2eaff', margin: '0 0 10px' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#7a9abf', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
        <section id="accuracy" style={{ padding: '100px 28px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '72px 48px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', borderRadius: 32, position: 'relative', overflow: 'hidden' }}
          >
            {/* Background blobs */}
            <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(30px)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(24px)' }} />

            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%' }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 22, background: 'rgba(255,255,255,0.18)', marginBottom: 28 }}>
                <Brain size={36} color="#fff" />
              </div>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-1px' }}>
                Ready to Transform Diagnostics?
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', marginBottom: 40, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 40px' }}>
                Join 2,500+ physicians using NeuraDx AI to deliver faster, more accurate diagnoses.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(0,0,0,0.3)' }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 36px', background: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#3A8BFF', cursor: 'pointer' }}
                >
                  Create Free Account <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 36px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 16, fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                >
                  Sign In
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid rgba(58,139,255,0.15)', padding: '32px 28px', textAlign: 'center', background: 'rgba(3,6,14,0.9)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e2eaff' }}>NeuraDx AI</span>
            </div>
            <p style={{ fontSize: 13, color: '#4a6a9a', margin: 0 }}>© 2024 NeuraDx AI · Medical Imaging Platform · HIPAA Compliant</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy', 'Terms', 'Security'].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: '#4a6a9a', textDecoration: 'none', fontWeight: 500 }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>

        {/* ── Responsive CSS ─────────────────────────────────────────────────── */}
        <style>{`
        @media (max-width: 900px) {
          section:first-of-type { grid-template-columns: 1fr !important; }
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 600px) {
          section[id="about"] > div > div:last-child { grid-template-columns: 1fr !important; }
          div[style*="repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      </div>{/* end content zIndex:1 wrapper */}
    </div>
  );
};

export default LandingPage;
