import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bike, MapPin, ChevronDown } from 'lucide-react';
import type { SystemStats } from '../api/useBikeData';

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 rounded-lg bg-white/5">
      <Icon size={14} className="text-white/50" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/35 leading-none">{label}</p>
      <p className="text-lg font-bold text-white leading-tight mt-0.5 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const StatsPanel = ({ stats }: { stats: SystemStats | null }) => {
  const [expanded, setExpanded] = useState(true);

  if (!stats) return null;

  const timeAgo = getTimeAgo(stats.lastUpdated);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="absolute top-6 right-14 z-10 w-[220px]"
    >
      <div className="bg-black/50 backdrop-blur-xl border border-white/6 rounded-2xl overflow-hidden">
        {/* Header - always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 pb-3 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Live Stats
            </span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} className="text-white/30" />
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <StatCard
                  icon={MapPin}
                  label="Stations"
                  value={stats.totalStations.toLocaleString()}
                  sub="across NYC"
                />
                <StatCard
                  icon={Bike}
                  label="Bikes Available"
                  value={stats.totalBikes.toLocaleString()}
                  sub={`of ${stats.totalCapacity.toLocaleString()} total`}
                />
                <StatCard
                  icon={Activity}
                  label="System Load"
                  value={`${stats.systemLoad}%`}
                />

                {/* Load bar */}
                <div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.systemLoad}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{
                        background:
                          stats.systemLoad > 80
                            ? '#ef4444'
                            : stats.systemLoad > 50
                              ? '#f59e0b'
                              : '#22c55e',
                      }}
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-[9px] text-white/20 text-right">
                  Updated {timeAgo}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
