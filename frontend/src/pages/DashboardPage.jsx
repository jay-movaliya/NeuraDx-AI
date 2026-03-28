import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Upload, FileText, Users, Activity, Clock, CheckCircle, AlertCircle,
  Bell, Search, Brain, Settings, ChevronRight, Calendar,
  TrendingUp, Zap, Shield, BarChart2, ArrowUpRight, Cpu, Wifi
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { dashboardAPI, scanAPI } from '../services/api';

/* ── Animated counter ─────────────────────────────────────────────────────── */
function useCounter(target, duration = 1.4) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = target / (duration * 60);
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(n));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

/* ── Custom tooltip ───────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '10px 16px', backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
          {p.name}: <span style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Stat card ────────────────────────────────────────────────────────────── */
const StatCard = ({ stat, idx }) => {
  const count = useCounter(stat.numericValue, 1.2 + idx * 0.15);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${stat.borderColor}`,
        borderRadius: 20, padding: '24px', backdropFilter: 'blur(20px)',
        position: 'relative', overflow: 'hidden', cursor: 'default',
        boxShadow: 'var(--shadow-card)',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
        background: stat.glowColor, borderRadius: '50%', filter: 'blur(40px)',
        opacity: 0.3, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'inline-flex', padding: 10, borderRadius: 14, background: stat.iconBg, marginBottom: 16 }}>
            <stat.icon size={20} color={stat.iconColor} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>
            {count.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, background: stat.trendBg,
          border: `1px solid ${stat.trendBorder}`, borderRadius: 8,
          padding: '4px 8px', fontSize: 12, fontWeight: 700, color: stat.trendColor,
        }}>
          <ArrowUpRight size={12} />{stat.trend}
        </div>
      </div>

      {/* Progress track */}
      <div style={{ marginTop: 20, height: 3, background: 'var(--border)', borderRadius: 99 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: stat.progress }}
          transition={{ delay: 0.6 + idx * 0.1, duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: stat.progressColor }}
        />
      </div>
    </motion.div>
  );
};

/* ── Priority badge ───────────────────────────────────────────────────────── */
const PriorityBadge = ({ priority }) => {
  const cfg = {
    urgent: { bg: 'var(--danger-bg)',  border: 'var(--danger-border)',  color: 'var(--danger)',  label: 'Urgent' },
    high:   { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning)', label: 'High' },
    normal: { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success)', label: 'Normal' },
  };
  const c = cfg[priority] || cfg.normal;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{c.label}</span>
  );
};

/* ── Dashboard ────────────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [time, setTime] = useState(new Date());
  const [searchFocused, setSearchFocused] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats and scans in parallel
        const [statsData, scansData] = await Promise.all([
          dashboardAPI.getStats(),
          scanAPI.getAll()
        ]);
        
        setDashboardStats(statsData);
        setRecentScans(scansData.scans || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate weekly chart data from scans
  const calculateWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Count scans for this day
      const dayScans = recentScans.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate >= date && scanDate < nextDate;
      });
      
      weekData.push({
        day: days[date.getDay()],
        scans: dayScans.length,
        reports: dayScans.filter(s => s.status === 'completed').length
      });
    }
    
    return weekData;
  };

  const chartData = calculateWeeklyData();

  // Calculate scan type distribution for pie chart
  const calculateScanTypeData = () => {
    const types = {};
    recentScans.forEach(scan => {
      const type = scan.scan_type || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  // Calculate severity distribution
  const calculateSeverityData = () => {
    const severities = { none: 0, low: 0, moderate: 0, high: 0 };
    recentScans.forEach(scan => {
      const severity = scan.severity || 'none';
      severities[severity] = (severities[severity] || 0) + 1;
    });
    
    return [
      { name: 'Normal', value: severities.none, color: '#10b981' },
      { name: 'Low', value: severities.low, color: '#fbbf24' },
      { name: 'Moderate', value: severities.moderate, color: '#f97316' },
      { name: 'High', value: severities.high, color: '#ef4444' },
    ].filter(item => item.value > 0);
  };

  const scanTypeData = calculateScanTypeData();
  const severityData = calculateSeverityData();
  const COLORS = ['#3A8BFF', '#4B83F6', '#06b6d4', '#10b981', '#22d3ee'];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const stats = [
    {
      label: 'Total Scans', numericValue: dashboardStats?.total_scans || 0,
      icon: Activity, iconColor: '#3A8BFF', iconBg: 'rgba(58,139,255,0.15)',
      glowColor: '#3A8BFF', borderColor: 'rgba(58,139,255,0.25)',
      trend: '+12%', trendColor: 'var(--success)', trendBg: 'var(--success-bg)', trendBorder: 'var(--success-border)',
      progress: '78%', progressColor: 'linear-gradient(90deg,#3A8BFF,#4B83F6)',
    },
    {
      label: 'Abnormalities Found', numericValue: dashboardStats?.abnormalities_found || 0,
      icon: AlertCircle, iconColor: '#f87171', iconBg: 'rgba(239,68,68,0.15)',
      glowColor: '#ef4444', borderColor: 'rgba(239,68,68,0.25)',
      trend: `${dashboardStats?.abnormalities_found || 0}`, trendColor: 'var(--danger)', trendBg: 'var(--danger-bg)', trendBorder: 'var(--danger-border)',
      progress: '15%', progressColor: 'linear-gradient(90deg,#ef4444,#f87171)',
    },
    {
      label: 'Completed Today', numericValue: dashboardStats?.completed_today || 0,
      icon: CheckCircle, iconColor: '#4ade80', iconBg: 'rgba(34,197,94,0.15)',
      glowColor: '#22c55e', borderColor: 'rgba(34,197,94,0.25)',
      trend: '+8%', trendColor: 'var(--success)', trendBg: 'var(--success-bg)', trendBorder: 'var(--success-border)',
      progress: '65%', progressColor: 'linear-gradient(90deg,#22c55e,#4ade80)',
    },
    {
      label: 'Avg Confidence', numericValue: Math.round(dashboardStats?.average_confidence || 0),
      icon: Brain, iconColor: '#4B83F6', iconBg: 'rgba(75,131,246,0.15)',
      glowColor: '#4B83F6', borderColor: 'rgba(75,131,246,0.25)',
      trend: `${Math.round(dashboardStats?.average_confidence || 0)}%`, trendColor: 'var(--success)', trendBg: 'var(--success-bg)', trendBorder: 'var(--success-border)',
      progress: `${dashboardStats?.average_confidence || 0}%`, progressColor: 'linear-gradient(90deg,#4B83F6,#3A8BFF)',
    },
  ];

  // Transform scans data for display
  const transformedScans = recentScans.map((scan, idx) => {
    const initials = scan.patient_name.split(' ').map(n => n[0]).join('').toUpperCase();
    const timeStr = new Date(scan.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Determine priority based on severity
    let priority = 'normal';
    if (scan.severity === 'high') priority = 'urgent';
    else if (scan.severity === 'moderate') priority = 'high';
    
    return {
      id: scan.id,
      patient: scan.patient_name,
      mrn: scan.patient_id,
      type: scan.scan_type,
      time: timeStr,
      confidence: Math.round(scan.confidence),
      status: scan.status,
      priority: priority,
      avatar: initials,
      severity: scan.severity,
      has_abnormality: scan.has_abnormality
    };
  });

  const avatarGradients = [
    ['#3A8BFF','#4B83F6'], ['#0891b2','#06b6d4'], ['#059669','#10b981'],
    ['#3A8BFF','#22d3ee'], ['#4B83F6','#0891b2'], ['#06b6d4','#10b981'],
  ];

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 22,
    backdropFilter: 'blur(20px)',
    boxShadow: 'var(--shadow-card)',
  };

  return (
    <div className="page-bg">
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 600, height: 600, background: `radial-gradient(circle, var(--orb-1) 0%, transparent 70%)`, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-18%', right: '-8%', width: 700, height: 700, background: `radial-gradient(circle, var(--orb-2) 0%, transparent 70%)`, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', right: '30%', width: 500, height: 500, background: `radial-gradient(circle, var(--orb-3) 0%, transparent 70%)`, borderRadius: '50%' }} />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--bg-nav)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: 42, height: 42, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Brain size={22} color="#fff" />
            </motion.div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                NeuraDx <span className="text-gradient">AI</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: -2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Medical Imaging Platform</div>
            </div>
          </div>

          {/* Search */}
          <motion.div
            animate={{ width: searchFocused ? 460 : 360 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ position: 'relative' }}
          >
            <Search size={16} color={searchFocused ? 'var(--accent)' : 'var(--text-faint)'} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }} />
            <input
              type="text"
              placeholder="Search patients, scans, reports..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="t-input"
              style={{ paddingLeft: 44, paddingRight: 52 }}
            />
            <kbd style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--bg-muted)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '2px 6px', fontSize: 10, color: 'var(--text-faint)',
            }}>⌘K</kbd>
          </motion.div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Bell */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} style={{
              position: 'relative', width: 40, height: 40, background: 'var(--bg-muted)',
              border: '1px solid var(--border)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Bell size={18} color="var(--text-secondary)" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-base)' }}
              />
            </motion.button>

            {/* Settings */}
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }} style={{
              width: 40, height: 40, background: 'var(--bg-muted)',
              border: '1px solid var(--border)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Settings size={18} color="var(--text-secondary)" />
            </motion.button>

            {/* Theme toggle */}
            <ThemeToggle />

            <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

            {/* Clock */}
            <div style={{ padding: '6px 12px', background: 'var(--accent-soft)', border: '1px solid var(--border-focus)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name || 'Dr. Smith'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Radiologist</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={handleLogout} title="Logout"
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{(user.name || 'D').charAt(0)}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 28px', position: 'relative', zIndex: 1 }}>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Brain size={16} color="var(--accent)" />
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  AI Dashboard
                </span>
              </div>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1, margin: 0 }}>
                Good morning,{' '}
                <span className="text-gradient">{user.name?.split(' ')[0] || 'Doctor'}</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 8 }}>
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 36px var(--accent-glow)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/upload')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                border: 'none', borderRadius: 16, padding: '14px 26px',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Upload size={18} /> New Analysis
            </motion.button>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20, marginBottom: 28 }}>
          {stats.map((s, i) => <StatCard key={i} stat={s} idx={i} />)}
        </div>

        {/* Chart + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, marginBottom: 24 }}>
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ ...card, padding: '26px 26px 18px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Weekly Activity</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Scans & reports processed this week</p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[{ color: 'var(--accent)', label: 'Scans' }, { color: 'var(--cyan)', label: 'Reports' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3A8BFF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3A8BFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="scans"   stroke="#3A8BFF" strokeWidth={2.5} fill="url(#gScans)"   name="Scans" />
                <Area type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={2.5} fill="url(#gReports)" name="Reports" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Quick Actions</h3>
            {[
              { icon: Upload,    title: 'New Analysis',    desc: 'Upload & analyze scan',  color: '#3A8BFF', route: '/upload' },
              { icon: FileText,  title: 'View Scans',      desc: 'Recent analyses',        color: '#4B83F6', route: '/upload' },
            ].map((a, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(a.route)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}55`; e.currentTarget.style.boxShadow = `0 6px 24px ${a.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: `${a.color}18`, border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={18} color={a.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
                </div>
                <ChevronRight size={15} color="var(--text-faint)" />
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Additional Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
          {/* Scan Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ ...card, padding: '26px' }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Scan Type Distribution</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Breakdown by imaging modality</p>
            </div>
            {scanTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={scanTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scanTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChart2 size={32} color="var(--text-faint)" style={{ marginBottom: 8 }} />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Severity Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{ ...card, padding: '26px' }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Severity Analysis</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Risk level distribution</p>
            </div>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <AlertCircle size={32} color="var(--text-faint)" style={{ marginBottom: 8 }} />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Scans List */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          style={{ ...card, padding: '26px' }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Scans</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Latest analysis results</p>
          </div>
          
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 12px' }} />
              Loading scans...
            </div>
          ) : transformedScans.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <Upload size={48} color="var(--text-faint)" style={{ marginBottom: 16 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No scans yet</h4>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Upload your first medical scan to get started with AI analysis</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
              >
                <Upload size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Upload Scan
              </motion.button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transformedScans.slice(0, 5).map((scan, idx) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px', borderRadius: 14,
                    background: 'var(--bg-muted)', border: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg,${avatarGradients[idx%avatarGradients.length][0]},${avatarGradients[idx%avatarGradients.length][1]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#fff',
                  }}>{scan.avatar}</div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{scan.patient}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{scan.type} • {scan.time}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: scan.confidence >= 90 ? 'var(--success)' : 'var(--accent)' }}>{scan.confidence}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</div>
                    </div>
                    <ChevronRight size={20} color="var(--text-faint)" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

     
      </div>
    </div>
  );
};

export default DashboardPage;
