import React from 'react';
import useCountdown from '../../hooks/useCountdown';
import { motion } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';

const CountdownTimer = ({ closeMinute = 50 }) => {
  const bettingTimer = useCountdown(closeMinute);
  const resultTimer = useCountdown(60);

  const isClosed = bettingTimer.timeLeft === 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 glass-card p-4 md:p-6 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
          <Zap size={80} />
        </div>
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Zap size={14} className={isClosed ? 'text-red-500' : 'text-primary'} />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Betting Window</span>
        </div>
        <div className="flex flex-col">
          <p className={`text-3xl md:text-4xl font-black font-mono tracking-tighter ${isClosed ? 'text-red-500' : 'text-white'}`}>
            {bettingTimer.formatted}
          </p>
          <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">
            {isClosed ? 'Wait for next hour' : 'Seconds until close'}
          </p>
        </div>
        
        {/* Progress Bar placeholder */}
        <div className="mt-4 md:mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: isClosed ? "0%" : "auto" }}
            className={`h-full ${isClosed ? 'bg-red-500' : 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
          />
        </div>
      </div>

      <div className="flex-1 glass-card p-4 md:p-6 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:-rotate-12 transition-transform duration-500">
          <Timer size={80} />
        </div>
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Timer size={14} className="text-accent" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Next Result</span>
        </div>
        <div className="flex flex-col">
          <p className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-white">
            {resultTimer.formatted}
          </p>
          <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Declaration countdown</p>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
