import { motion } from 'framer-motion';
import type { SystemStats } from '../api/useBikeData';

const items = [
  { color: '#ef4444', label: 'Critical', key: 'criticalCount' as const },
  { color: '#f59e0b', label: 'Low', key: 'lowCount' as const },
  { color: '#22c55e', label: 'Healthy', key: 'healthyCount' as const },
];

export const StatusLegend = ({ stats }: { stats: SystemStats | null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.5 }}
    className="absolute bottom-6 left-6 z-10"
  >
    <div className="bg-black/50 backdrop-blur-xl border border-white/6 rounded-2xl p-4 min-w-[180px]">
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-3">
        Station Health
      </h4>
      <div className="space-y-2.5">
        {items.map(({ color, label, key }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
              />
              <span className="text-xs font-medium text-white/70">{label}</span>
            </div>
            <span className="text-xs font-bold text-white/90 tabular-nums">
              {stats ? stats[key].toLocaleString() : '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
