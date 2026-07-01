import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Wallet, Plus, ArrowUpRight, History, Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const WalletPage = () => {
  const { user, fetchWallet } = useAuth();

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wallet | 50xcards</title>
      </Helmet>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Landmark className="text-accent" size={18} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Financial Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black premium-gradient-text">Personal Wallet</h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group max-w-2xl mx-auto mb-8"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Wallet size={200} />
          </div>
          
          <div className="relative z-10 text-center mb-10">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-3">Total Equity</p>
            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
              ₹{user.wallet_balance.toLocaleString()}
            </h2>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <Link
              to="/deposit"
              className="w-full btn-primary py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              <Plus size={20} /> DEPOSIT FUNDS
            </Link>
            
            <Link
              to="/withdraw"
              className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all uppercase tracking-widest"
            >
              <ArrowUpRight size={20} /> WITHDRAW FUNDS
            </Link>
            
            <Link
              to="/transactions"
              className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase tracking-widest mt-2"
            >
              <History size={20} /> TRANSACTION LOGS
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-[2rem] border-none bg-blue-500/5 max-w-2xl mx-auto flex items-start gap-4"
        >
          <ShieldCheck className="text-blue-400 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-blue-400 mb-1">Bank-Grade Security</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              All transactions are encrypted and audited. Withdrawals process within 2-6 hours to ensure full compliance and safety of your funds.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WalletPage;
