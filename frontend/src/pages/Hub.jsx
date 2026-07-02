import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Bell, ShieldCheck, Gamepad2, Zap } from 'lucide-react';

const Hub = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#12141D] text-white flex flex-col md:pb-0">
      <Helmet>
        <title>Home | 50xcards</title>
      </Helmet>

      {/* Top Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <User className="text-primary" size={20} />
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border border-[#FFD700] border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <WalletIcon />
            <span className="font-black text-sm text-white">₹{user?.wallet_balance || 0}</span>
          </div>
          <button className="text-white">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable if needed, but designed to fit) */}
      <main className="flex-1 px-4 flex flex-col gap-6 max-w-md mx-auto w-full">
        
        {/* Promotional Banner */}
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl border border-[#FFD700]/30 bg-gradient-to-br from-gray-900 to-black p-4 flex flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <ShieldCheck className="text-[#FFD700] mb-2 z-10" size={32} />
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#B8860B] uppercase tracking-widest z-10 filter drop-shadow-lg">
            50X Cards
          </h2>
          <p className="text-[#FFD700] text-[10px] tracking-[0.3em] uppercase font-bold mt-1 z-10">Premium Casino</p>
          <div className="flex gap-4 mt-4 z-10">
            <span className="text-[9px] font-black uppercase text-white/70 bg-white/10 px-2 py-1 rounded">Fast</span>
            <span className="text-[9px] font-black uppercase text-white/70 bg-white/10 px-2 py-1 rounded">Fair</span>
            <span className="text-[9px] font-black uppercase text-white/70 bg-white/10 px-2 py-1 rounded">Secure</span>
          </div>
        </div>

        {/* Live Games Section */}
        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-bold mb-4">Live Games</h3>
          
          <div className="flex flex-col gap-4">
            {/* 50x Cards Arena Button */}
            <Link 
              to="/arena" 
              className="relative w-full h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFE066] to-[#F5B700] p-6 flex flex-col justify-center shadow-[0_10px_30px_rgba(245,183,0,0.3)] active:scale-95 transition-transform"
            >
              {/* Background Graphics */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
                <div className="absolute grid grid-cols-3 gap-2 right-4 top-4 rotate-12">
                  <div className="w-8 h-8 bg-black rounded-lg" />
                  <div className="w-8 h-8 bg-black rounded-lg" />
                  <div className="w-8 h-8 bg-black rounded-lg" />
                  <div className="w-8 h-8 bg-black rounded-lg" />
                  <div className="w-8 h-8 bg-black rounded-lg" />
                  <div className="w-8 h-8 bg-black rounded-lg" />
                </div>
              </div>

              <div className="relative z-10 text-black">
                <h4 className="text-3xl font-black uppercase tracking-tight">50X Cards</h4>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Arena</p>
              </div>
            </Link>

            {/* Colour Game Button (Placeholder) */}
            <button 
              className="relative w-full h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E5BFF] to-[#0B25B3] p-6 flex flex-col justify-center shadow-[0_10px_30px_rgba(46,91,255,0.3)] active:scale-95 transition-transform text-left"
              onClick={() => alert("Coming Soon!")}
            >
              {/* Background Graphics */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-4 opacity-80">
                 <div className="w-16 h-16 rounded-full bg-[#FFD700] relative -right-4 -top-4" />
                 <div className="w-12 h-12 rounded-full bg-[#FF3366] absolute bottom-4 right-8" />
              </div>

              <div className="relative z-10 text-white">
                <h4 className="text-3xl font-black uppercase tracking-tight">Colour</h4>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Game</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

export default Hub;
