import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Plus, Eye, Edit,
  Download, MoreVertical, Phone, Calendar, Activity, User
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const patients = [
    { id: 1, name: 'John Doe',       age: 45, gender: 'Male',   phone: '+1 234 567 8900', email: 'john.doe@email.com',     lastVisit: '2024-03-28', scans: 5, status: 'Active',    avatar: 'JD', bloodType: 'A+',  nextAppointment: '2024-04-05', color: ['#3A8BFF','#4B83F6'] },
    { id: 2, name: 'Jane Smith',     age: 38, gender: 'Female', phone: '+1 234 567 8901', email: 'jane.smith@email.com',   lastVisit: '2024-03-27', scans: 3, status: 'Active',    avatar: 'JS', bloodType: 'O+',  nextAppointment: '2024-04-10', color: ['#0891b2','#06b6d4'] },
    { id: 3, name: 'Bob Johnson',    age: 52, gender: 'Male',   phone: '+1 234 567 8902', email: 'bob.johnson@email.com',  lastVisit: '2024-03-26', scans: 8, status: 'Follow-up', avatar: 'BJ', bloodType: 'B+',  nextAppointment: '2024-04-03', color: ['#d97706','#f59e0b'] },
    { id: 4, name: 'Alice Brown',    age: 29, gender: 'Female', phone: '+1 234 567 8903', email: 'alice.brown@email.com',  lastVisit: '2024-03-25', scans: 2, status: 'Active',    avatar: 'AB', bloodType: 'AB+', nextAppointment: '2024-04-15', color: ['#059669','#10b981'] },
    { id: 5, name: 'Carlos Rivera',  age: 61, gender: 'Male',   phone: '+1 234 567 8904', email: 'c.rivera@email.com',     lastVisit: '2024-03-24', scans: 11,status: 'Critical',  avatar: 'CR', bloodType: 'O-',  nextAppointment: '2024-04-01', color: ['#dc2626','#f87171'] },
    { id: 6, name: 'Mia Thompson',   age: 34, gender: 'Female', phone: '+1 234 567 8905', email: 'mia.t@email.com',        lastVisit: '2024-03-23', scans: 4, status: 'Active',    avatar: 'MT', bloodType: 'A-',  nextAppointment: '2024-04-20', color: ['#3A8BFF','#4B83F6'] },
  ];

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
    const matchFilter = filterType === 'all' || p.status === filterType;
    return matchSearch && matchFilter;
  });

  const statuses = ['Active','Follow-up','Critical'];
  const statusColor = {
    Active:    { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success)' },
    'Follow-up': { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning)' },
    Critical:  { bg: 'var(--danger-bg)',   border: 'var(--danger-border)',   color: 'var(--danger)' },
  };

  const summaryStats = [
    { label: 'Total Patients', value: patients.length,                                          color: 'var(--accent)' },
    { label: 'Active',         value: patients.filter(p => p.status === 'Active').length,        color: 'var(--success)' },
    { label: 'Follow-up',      value: patients.filter(p => p.status === 'Follow-up').length,     color: 'var(--warning)' },
    { label: 'Critical',       value: patients.filter(p => p.status === 'Critical').length,      color: 'var(--danger)' },
  ];

  return (
    <div className="page-bg">
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-nav)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <motion.button
            whileHover={{ x: -4 }} onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            <ArrowLeft size={18} color="var(--text-secondary)" /> Back to Dashboard
          </motion.button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Patient Records</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -1 }}>{patients.length} total patients</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle size="sm" />
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px var(--accent-glow)' }} whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                color: '#fff', border: 'none', borderRadius: 14, padding: '10px 20px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Plus size={16} /> Add Patient
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main style={{ maxWidth: 1300, margin: '0 auto', padding: '36px 28px', position: 'relative', zIndex: 1 }}>
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>🏥 Patient Management</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Patient <span className="text-gradient">Records</span></h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Manage and view patient information</p>
        </motion.div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
          {summaryStats.map((s, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 22px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)' }}
            >
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 34, fontWeight: 800, color: s.color, margin: '8px 0 0', letterSpacing: '-1px' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)', marginBottom: 24 }}
        >
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <Search size={16} color="var(--text-faint)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone..." className="t-input" style={{ paddingLeft: 44 }}
              />
            </div>

            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['all', ...statuses].map(s => (
                <motion.button
                  key={s} onClick={() => setFilterType(s)} whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: filterType === s ? '1px solid var(--border-focus)' : '1px solid var(--border)',
                    background: filterType === s ? 'var(--accent-soft)' : 'var(--bg-muted)',
                    color: filterType === s ? 'var(--text-link)' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >{s === 'all' ? 'All' : s}</motion.button>
              ))}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '8px 12px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Download size={16} color="var(--text-secondary)" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Patient cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          <AnimatePresence>
            {filteredPatients.map((p, idx) => {
              const sc = statusColor[p.status] || statusColor.Active;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }} transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -6, boxShadow: `0 16px 48px var(--accent-glow)` }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 22, padding: '22px', backdropFilter: 'blur(20px)',
                    boxShadow: 'var(--shadow-card)', cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Top-right glow */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${p.color[0]}22, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 16, flexShrink: 0,
                        background: `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 800, color: '#fff',
                        boxShadow: `0 4px 16px ${p.color[0]}44`,
                      }}>{p.avatar}</div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.name}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.age} years • {p.gender}</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }}
                      style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <MoreVertical size={15} color="var(--text-faint)" />
                    </motion.button>
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                    {[
                      { icon: Phone,    text: p.phone },
                      { icon: Calendar, text: `Last visit: ${p.lastVisit}` },
                      { icon: Activity, text: `Total scans: ${p.scans}` },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <row.icon size={14} color="var(--text-faint)" />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status + Blood type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Blood: {p.bloodType}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: 'var(--shadow-glow)' }}>
                      <Eye size={15} /> View
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ width: 40, height: 40, background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Edit size={15} color="var(--text-secondary)" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredPatients.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <User size={32} color="var(--text-faint)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No patients found</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PatientsPage;
