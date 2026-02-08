import { motion } from 'framer-motion';
import { MapView } from './map/MapView';
import { useBikeData } from './api/useBikeData';
import { StatusLegend } from './components/StatusLegend';
import { StatsPanel } from './components/StatsPanel';

function App() {
  console.log('🚀 App component rendering');
  const { data: geoData, stats, error, isLoading } = useBikeData();
  console.log('📊 App state:', { isLoading, hasData: !!geoData, error });

  if (isLoading || !geoData) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-2xl font-black italic uppercase tracking-tight">
          Citi<span className="text-red-500">Pulse</span>
        </h1>
        <p className="text-white/30 text-xs font-mono mt-2 animate-pulse">
          Connecting to live network...
        </p>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <div className="text-center max-w-sm">
        <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-4 animate-pulse" />
        <p className="text-white/80 font-semibold mb-1 text-sm">Connection Failed</p>
        <p className="text-white/30 text-xs">
          Backend unreachable at {import.meta.env.VITE_API_URL || 'http://localhost:5000'}
        </p>
        <p className="text-white/20 text-[10px] mt-3 font-mono">{error}</p>
      </div>
    </div>
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <MapView data={geoData} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-10 pointer-events-none"
      >
        <h1 className="text-white text-xl font-black italic uppercase leading-none tracking-tight">
          Citi<span className="text-red-500">Pulse</span>
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-white/25 text-[9px] font-mono tracking-wider">
            NYC BIKE NETWORK / LIVE
          </p>
        </div>
      </motion.div>

      <StatusLegend stats={stats} />
      <StatsPanel stats={stats} />
    </main>
  );
}

export default App;
