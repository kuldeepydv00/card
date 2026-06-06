import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import DepositModal from '../components/wallet/DepositModal';
import WithdrawForm from '../components/wallet/WithdrawForm';
import { Wallet, Plus, ArrowUpRight, History, ShieldCheck, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WalletPage = () => {
  const { user, fetchWallet } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);

  // Fetch wallet balance when component mounts to ensure it's fresh
  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Landmark className="text-accent" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Financial Center</span>
          </div>
          <h1 className="text-4xl font-black premium-gradient-text">Personal Wallet</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Balance & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Wallet size={180} />
              </div>
              
              <div className="relative z-10">
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-2">Total Equity</p>
                <h2 className="text-5xl font-black text-white mb-10 tracking-tighter">
                  ₹{user.wallet_balance.toLocaleString()}
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDeposit(true)}
                    className="w-full btn-primary flex items-center justify-center gap-3 py-4"
                  >
                    <Plus size={20} /> DEPOSIT FUNDS
                  </button>
                  <button
                    onClick={() => document.getElementById('withdraw-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all uppercase tracking-widest"
                  >
                    <ArrowUpRight size={18} /> WITHDRAW FUNDS
                  </button>
                  <Link
                    to="/transactions"
                    className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    <History size={18} /> TRANSACTION LOGS
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] border-none bg-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-blue-400" size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest text-blue-400">Security Audit</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                All withdrawal requests are manually audited for security compliance. This ensures the integrity of the platform and the safety of your funds. Settlement usually takes 2-6 hours.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Withdraw Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
            id="withdraw-section"
          >
            <div className="glass-card rounded-3xl md:rounded-[3rem] overflow-hidden">
              <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <ArrowUpRight className="text-red-500" /> Withdraw Funds
                </h3>
              </div>
              <div className="p-6 md:p-10">
                <WithdrawForm 
                  balance={user.wallet_balance} 
                  onSuccess={() => {
                    fetchWallet();
                  }} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showDeposit && (
          <DepositModal 
            onClose={() => setShowDeposit(false)} 
            onSuccess={() => {}} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
