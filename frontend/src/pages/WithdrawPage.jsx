import React from 'react';
import { ChevronLeft, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Helmet } from 'react-helmet-async';
import WithdrawForm from '../components/wallet/WithdrawForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const WithdrawPage = () => {
  const { user, fetchWallet } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Withdraw Funds | 50xcards</title>
      </Helmet>
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/wallet" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase">WITHDRAW <span className="text-red-500">FUNDS</span></h1>
            <p className="text-gray-500 text-xs mt-1">Available balance: ₹{user?.wallet_balance?.toLocaleString() || 0}</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
              <ArrowUpRight className="text-red-500" /> SECURE WITHDRAWAL
            </h3>
          </div>
          <div className="p-6 md:p-10">
            <WithdrawForm 
              balance={user?.wallet_balance || 0} 
              onSuccess={() => {
                fetchWallet();
                navigate('/wallet');
              }} 
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WithdrawPage;
