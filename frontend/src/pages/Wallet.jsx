import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const WalletPage = () => {
  const { user, fetchWallet } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="min-h-screen bg-[#18191E] text-white flex flex-col font-sans pb-6">
      <Helmet>
        <title>Wallet | 50xcards</title>
      </Helmet>

      {/* Custom Mobile Header */}
      <header className="flex items-center justify-between p-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-300 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-100">Wallet</h1>
        <div className="w-10" /> {/* Spacer for center alignment */}
      </header>

      <main className="flex-1 px-4 flex flex-col gap-4 max-w-md mx-auto w-full mt-2">
        {/* Main Balance Card */}
        <div className="bg-[#23262F] rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
           {/* Faint Background Pattern */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
           
           <h2 className="text-gray-300 font-medium mb-3 relative z-10 text-sm">Winning Balance</h2>
           <h3 className="text-6xl font-black text-white mb-8 tracking-tighter relative z-10 drop-shadow-md">
             ₹{user.wallet_balance}
           </h3>
           
           <div className="bg-[#2ECC71] text-white text-xs font-bold px-5 py-2 rounded-full relative z-10 shadow-[0_0_15px_rgba(46,204,113,0.4)] tracking-wide">
             100% Safe & Secure
           </div>
        </div>

        {/* Exchange Value Button */}
        <button className="w-full bg-[#23262F] hover:bg-[#2A2E39] transition-colors border border-white/5 text-gray-200 font-bold py-4 rounded-[1.25rem] text-sm shadow-md mt-2">
          Exchange Winning Value
        </button>

        {/* 3 Box Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#23262F] border border-white/5 rounded-[1.25rem] p-4 flex flex-col items-center justify-center shadow-md">
            <span className="font-black text-lg text-white">₹{user.wallet_balance}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Deposit</span>
          </div>
          <div className="bg-[#23262F] border border-white/5 rounded-[1.25rem] p-4 flex flex-col items-center justify-center shadow-md">
            <span className="font-black text-lg text-white">₹0</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Bonus</span>
          </div>
          <div className="bg-[#23262F] border border-white/5 rounded-[1.25rem] p-4 flex flex-col items-center justify-center shadow-md">
            <span className="font-black text-lg text-white">₹0</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Commission</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <Link to="/deposit" className="bg-[#FFD700] hover:bg-[#F5CC00] text-black font-black py-4 rounded-[1.25rem] text-center uppercase tracking-wide shadow-[0_4px_15px_rgba(255,215,0,0.3)] transition-colors">
            ADD
          </Link>
          <Link to="/withdraw" className="bg-[#23262F] hover:bg-[#2A2E39] border border-white/5 text-white font-black py-4 rounded-[1.25rem] text-center uppercase tracking-wide shadow-md transition-colors">
            WITHDRAW
          </Link>
        </div>

        {/* Deposit History */}
        <Link to="/transactions" className="w-full bg-[#23262F] hover:bg-[#2A2E39] border border-white/5 text-gray-200 font-bold py-4 rounded-[1.25rem] text-center mt-1 shadow-md text-sm transition-colors">
          Deposit History
        </Link>
      </main>
    </div>
  );
};

export default WalletPage;
