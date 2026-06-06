import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import { Wallet, ArrowDownCircle, ArrowUpCircle, PlusCircle, Trophy, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deposit': return <PlusCircle className="text-green-400" />;
      case 'withdrawal': return <ArrowUpCircle className="text-red-400" />;
      case 'bet_placed': return <ArrowDownCircle className="text-gray-500" />;
      case 'winning': return <Trophy className="text-accent" />;
      default: return <Wallet />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="text-primary" size={18} />
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Financial Audit</span>
            </div>
            <h1 className="text-4xl font-black premium-gradient-text">Activity Logs</h1>
            <p className="text-gray-500 text-sm mt-2">Comprehensive trail of all wallet operations</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group hidden md:block">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filter logs..." 
                  className="bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-primary/50 outline-none transition-all"
                />
             </div>
             <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:border-primary/50 transition-all text-gray-500 hover:text-white">
                <Filter size={18} />
             </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-24 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Accessing Vault...</span>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-24 text-center glass-card rounded-[2.5rem] border-dashed border-white/10">
                <p className="text-gray-600 italic text-sm">No activity recorded in the ledger</p>
              </div>
            ) : (
              transactions.map((txn, index) => (
                <motion.div 
                  key={txn._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-primary transition-colors" />
                  
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                      {getIcon(txn.type)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-white">{txn.type.replace('_', ' ')}</h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">
                        {new Date(txn.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-medium max-w-md line-clamp-1">{txn.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-black ${txn.amount > 0 ? 'text-green-500' : 'text-gray-200'}`}>
                      {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Balance</span>
                      <span className="text-xs font-black text-gray-500 italic">₹{txn.wallet_balance_after.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
