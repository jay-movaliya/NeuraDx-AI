import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Animated pill toggle for dark ↔ light mode.
 * Drop it anywhere inside ThemeProvider.
 */
const ThemeToggle = ({ size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const small = size === 'sm';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'relative',
        width:  small ? 44 : 52,
        height: small ? 24 : 28,
        borderRadius: 99,
        background: isDark
          ? 'rgba(99,102,241,0.15)'
          : 'rgba(79,70,229,0.12)',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.25)'}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 3,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <span style={{
        position: 'absolute', left: 5,
        fontSize: small ? 9 : 10,
        opacity: isDark ? 0.4 : 0,
        transition: 'opacity 0.3s',
        userSelect: 'none',
      }}>🌙</span>
      <span style={{
        position: 'absolute', right: 5,
        fontSize: small ? 9 : 10,
        opacity: isDark ? 0 : 0.6,
        transition: 'opacity 0.3s',
        userSelect: 'none',
      }}>☀️</span>

      {/* Sliding thumb */}
      <motion.div
        animate={{ x: isDark ? 0 : (small ? 20 : 24) }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          width:  small ? 18 : 22,
          height: small ? 18 : 22,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${isDark ? '#3A8BFF, #4B83F6' : '#3A8BFF, #4B83F6'})`,
          boxShadow: isDark
            ? '0 2px 8px rgba(58,139,255,0.5)'
            : '0 2px 8px rgba(58,139,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isDark
          ? <Moon size={small ? 9 : 11} color="#fff" />
          : <Sun  size={small ? 9 : 11} color="#fff" />
        }
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
