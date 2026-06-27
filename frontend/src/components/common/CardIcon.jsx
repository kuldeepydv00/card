import React from 'react';

const SUITS = {
  H: { label: '♥', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  D: { label: '♦', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  C: { label: '♣', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  S: { label: '♠', color: 'text-gray-200', bg: 'bg-white/10', border: 'border-white/20' },
};

const CardIcon = ({ cardCode, size = 'sm', className = '' }) => {
  if (!cardCode || cardCode.length < 2) return <span className="text-gray-500">-</span>;
  
  const suitCode = cardCode.slice(-1);
  const rank = cardCode.slice(0, -1);
  
  const suit = SUITS[suitCode];
  if (!suit) return <span className="font-bold text-gray-400">{cardCode}</span>;

  const sizeClasses = {
    sm: 'w-10 h-12 text-sm',
    md: 'w-12 h-16 text-base',
    lg: 'w-16 h-24 text-xl'
  };

  return (
    <div className={`
      relative flex flex-col items-center justify-center 
      ${sizeClasses[size]}
      rounded-xl border ${suit.border} ${suit.bg} backdrop-blur-md overflow-hidden ${className}
    `}>
      <span className={`font-black ${suit.color} tracking-tighter leading-none`}>{rank}</span>
      <span className={`mt-0.5 ${suit.color} leading-none text-xs`}>{suit.label}</span>
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-white/5 rounded-tl-lg opacity-50" />
    </div>
  );
};

export default CardIcon;
