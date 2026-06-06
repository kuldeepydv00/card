import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import { History, Trophy, Clock, TrendingUp, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results/latest?limit=24');
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                LAST <span className="text-primary">RESULTS</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">Audit of the last 24 successful game declarations</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
            <Clock size={16} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">24 HOUR CYCLE</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Synchronizing Archives...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, index) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all border border-white/5"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                    <History size={20} className="group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">
                      {new Date(res.hour_slot).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-lg font-black text-white">
                      {new Date(res.hour_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">POOL VOLUME</span>
                    <span className="text-sm font-black text-gray-400">₹{res.total_bet_volume.toLocaleString()}</span>
                  </div>
                  <div className="w-14 h-16 bg-background rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:scale-110 transition-transform shadow-2xl">
                    <div className="absolute top-1 left-1.5 opacity-10">
                      <Trophy size={10} />
                    </div>
                    <span className="text-2xl font-black text-accent tracking-tighter">{res.winning_card}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {results.length === 0 && (
              <div className="col-span-full py-32 text-center glass-card rounded-[3rem]">
                <p className="text-gray-500 font-medium">No historical records found in current sector</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsHistory;
