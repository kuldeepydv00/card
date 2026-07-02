import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import CardIcon from '../components/common/CardIcon';
import { History, ChevronLeft, ChevronRight, Filter, Trophy, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyBets = () => {
  const [bets, setBets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ onlyWon: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBets();
  }, [page, filters]);

  const fetchBets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bets/history?page=${page}&limit=10&onlyWon=${filters.onlyWon}`);
      setBets(data.bets);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch bets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Bets | 50xcards</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <History className="text-primary" size={18} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Archive</span>
            </div>
            <h1 className="text-4xl font-black premium-gradient-text">Betting History</h1>
            <p className="text-gray-500 text-sm mt-2">Track your strategies and performance across all slots</p>
          </div>

          <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/5">
            <button
              onClick={() => { setFilters({ ...filters, onlyWon: false }); setPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                !filters.onlyWon ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ALL WAGERS
            </button>
            <button
              onClick={() => { setFilters({ ...filters, onlyWon: true }); setPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                filters.onlyWon ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Trophy size={14} />
              WINNINGS ONLY
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] overflow-hidden border-none"
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02] whitespace-nowrap">
                  <th className="px-8 py-6">Time & Slot</th>
                  <th className="px-8 py-6">Champion Card</th>
                  <th className="px-8 py-6">Wager</th>
                  <th className="px-8 py-6">Outcome</th>
                  <th className="px-8 py-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Synchronizing...</span>
                        </div>
                      </td>
                    </motion.tr>
                  ) : bets.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20 px-4">
                          <Target size={32} className="w-12 h-12" />
                          <span className="text-sm font-bold uppercase tracking-tighter whitespace-normal text-center">No records found in this sector</span>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    bets.map((bet, index) => (
                      <motion.tr 
                        key={bet._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex w-10 h-10 bg-background rounded-xl items-center justify-center border border-white/5 text-gray-500">
                              <Clock size={16} />
                            </div>
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-sm font-black text-white">
                                {new Date(bet.hour_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] font-bold text-gray-500">
                                {new Date(bet.hour_slot).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <CardIcon cardCode={bet.card_code} size="sm" className="group-hover:scale-110 transition-transform origin-left" />
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-gray-300">₹{bet.bet_amount.toLocaleString()}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {bet.status === 'pending' ? (
                            <div className="flex items-center gap-2 text-yellow-500">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
                            </div>
                          ) : bet.win_amount > 0 ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Successful</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Defeated</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`text-lg font-black ${bet.win_amount > 0 ? 'text-accent' : 'text-gray-700'}`}>
                            {bet.win_amount > 0 ? `+₹${bet.win_amount.toLocaleString()}` : '—'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Synchronizing...</span>
                  </div>
                </motion.div>
              ) : bets.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20 px-4">
                    <Target size={32} />
                    <span className="text-xs font-bold uppercase tracking-tighter text-center">No records found</span>
                  </div>
                </motion.div>
              ) : (
                bets.map((bet, index) => (
                  <motion.div 
                    key={bet._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-white/5 text-gray-500 shrink-0">
                          <Clock size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">
                            {new Date(bet.hour_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500">
                            {new Date(bet.hour_slot).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {bet.status === 'pending' ? (
                          <div className="px-3 py-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Processing</span>
                          </div>
                        ) : bet.win_amount > 0 ? (
                          <div className="px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Successful</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Defeated</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-background/50 p-3 rounded-2xl border border-white/5 items-center">
                      <div className="flex flex-col items-center justify-center border-r border-white/5">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Card</span>
                        <CardIcon cardCode={bet.card_code} size="sm" className="scale-75 origin-center" />
                      </div>
                      <div className="flex flex-col items-center justify-center border-r border-white/5">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Wager</span>
                        <span className="text-sm font-black text-gray-300">₹{bet.bet_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Payout</span>
                        <span className={`text-sm font-black ${bet.win_amount > 0 ? 'text-accent' : 'text-gray-600'}`}>
                          {bet.win_amount > 0 ? `+₹${bet.win_amount.toLocaleString()}` : '—'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-8 py-6 bg-white/[0.01] border-t border-white/5">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sector {page} of {totalPages}</span>
            <div className="flex gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:border-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:border-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MyBets;
