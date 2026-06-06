import React from 'react';
import { motion } from 'framer-motion';

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = [
  { code: 'H', label: '♥', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { code: 'D', label: '♦', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { code: 'C', label: '♣', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { code: 'S', label: '♠', color: 'text-gray-200', bg: 'bg-white/10', border: 'border-white/20' },
];

const CardGrid = ({ onCardClick }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-13 gap-3 p-1 rounded-2xl">
      {RANKS.map((rank, rIdx) => (
        <div key={rank} className="flex flex-col gap-3">
          {SUITS.map((suit, sIdx) => {
            const cardCode = `${rank}${suit.code}`;
            return (
              <motion.button
                key={cardCode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rIdx * 0.02) + (sIdx * 0.05) }}
                onClick={() => onCardClick(cardCode)}
                className={`
                  relative flex flex-col items-center justify-center h-16 md:h-24 w-full
                  rounded-2xl border ${suit.border} ${suit.bg} backdrop-blur-md
                  hover:scale-110 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20
                  transition-all duration-300 group overflow-hidden
                `}
              >
                <div className="absolute top-1 left-1.5 text-[10px] font-black opacity-30 group-hover:opacity-100 transition-opacity hidden md:block">
                  {suit.label}
                </div>
                <span className={`text-lg md:text-xl font-black ${suit.color} tracking-tighter leading-none`}>{rank}</span>
                <span className={`text-xl md:text-2xl mt-0 md:mt-0.5 ${suit.color} group-hover:scale-125 transition-transform leading-none`}>{suit.label}</span>
                
                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white/5 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
