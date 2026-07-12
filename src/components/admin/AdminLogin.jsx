import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { login } from '../../lib/store';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(password);
      if (result && result.token) { onLogin(); } else { setError('Invalid password.'); }
    } catch { setError('Authentication failed. Check password.'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-gold-light/15 blur-[100px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg shadow-rose/5 border border-white/5">
          <div className="text-center mb-8">
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="font-syne text-3xl tracking-[0.15em] text-white mb-2">ANNIE</motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2.5">
              <div className="h-px w-7 bg-gradient-to-r from-transparent to-rose/30" />
              <span className="text-[11px] tracking-[0.25em] uppercase text-rose/60 font-medium">Admin Portal</span>
              <div className="h-px w-7 bg-gradient-to-l from-transparent to-rose/30" />
            </motion.div>
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-5">
              <label className="block text-[11px] tracking-[0.18em] uppercase text-white/50 mb-1.5 font-medium">Access Code</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-charcoal-lighter/40 text-sm focus:border-rose/30"
                autoFocus disabled={loading} />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="mb-4 px-3 py-2.5 rounded-lg bg-white/5 border border-rose/15 text-rose text-xs text-center">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading || !password}
              className="btn-rose w-full py-3 rounded-xl text-sm tracking-[0.12em] uppercase font-medium disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-center text-[10px] tracking-[0.18em] uppercase text-white/50/40 mt-6">
            Authorized personnel only
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-4 text-center">
            <Link to="/" className="text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-rose/60 transition-colors duration-300">
              ← Back to Home
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
