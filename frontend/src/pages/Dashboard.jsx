import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import CardGrid from '../components/betting/CardGrid';
import BetModal from '../components/betting/BetModal';
import DepositModal from '../components/wallet/DepositModal';
import CountdownTimer from '../components/common/CountdownTimer';
import { toast } from 'react-hot-toast';
import { Wallet, Trophy, History, TrendingDown, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, updateWallet } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentBets, setCurrentBets] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    fetchCurrentBets();
    fetchLatestResults();
  }, []);

  const fetchCurrentBets = async () => {
    try {
      const { data } = await api.get('/bets/current');
      setCurrentBets(data);
    } catch (error) {
      console.error('Failed to fetch bets');
    }
  };

  const fetchLatestResults = async () => {
    try {
      const { data } = await api.get('/results/latest?limit=24');
      setLastResults(data);
    } catch (error) {
      console.error('Failed to fetch results');
    }
  };

  const handlePlaceBet = async (amount) => {
    try {
      const { data } = await api.post('/bet/place', {
        cardCode: selectedCard,
        betAmount: amount
      });
      toast.success(`Bet placed on ${selectedCard}!`);
      fetchCurrentBets();
      updateWallet(user.wallet_balance - amount);
      setSelectedCard(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place bet');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section / Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="glass-card rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
                <Target size={200} />
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="text-primary" size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Play</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 premium-gradient-text">Today is a good day</h1>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  Try your luck and pick the winning card to multiply your stake. Fortune favors the bold!
                </p>
              </div>

              <div className="w-px h-24 bg-white/10 hidden md:block" />

              <div className="flex flex-col items-center md:items-end text-center md:text-right relative z-10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Balance</p>
                <h2 className="text-3xl md:text-4xl font-black text-accent mb-4">₹{user.wallet_balance.toLocaleString()}</h2>
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-primary transition-all relative z-20 cursor-pointer"
                >
                  Fast Deposit
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <CountdownTimer />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Game Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Trophy className="text-accent" /> THE ARENA
                </h3>
                <p className="text-gray-500 text-sm mt-1">Select your champion card</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Info size={12} /> ALL BETS SETTLE AT THE TOP OF THE HOUR
              </div>
            </div>

            <CardGrid onCardClick={setSelectedCard} />
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Last Results */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-400">
                <History className="text-primary" size={16} /> Recent Results
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
                {lastResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 text-xs italic">Waiting for next declaration...</div>
                ) : (
                  lastResults.map((res) => (
                    <div key={res._id} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          {new Date(res.hour_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-primary/70 font-bold tracking-tighter">SUCCESSFUL</span>
                      </div>
                      <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-white/5 font-black text-accent text-lg group-hover:scale-110 transition-transform">
                        {res.winning_card}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Bets */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-400">
                <Target className="text-accent" size={16} /> Your Active Bets
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                {currentBets.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600 text-xs italic mb-4">No active bets for this hour</p>
                    <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">How to play?</button>
                  </div>
                ) : (
                  currentBets.map((bet) => (
                    <div key={bet._id} className="flex justify-between items-center p-4 bg-background border border-white/5 rounded-2xl relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block">CARD</span>
                        <span className="font-black text-lg">{bet.card_code}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 block">STAKE</span>
                        <span className="font-black text-accent">₹{bet.bet_amount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {selectedCard && (
          <BetModal
            key="bet-modal"
            cardCode={selectedCard}
            balance={user.wallet_balance}
            onClose={() => setSelectedCard(null)}
            onSubmit={handlePlaceBet}
            onBetPlaced={() => {
              setSelectedCard(null);
              fetchCurrentBets();
            }}
          />
        )}
        
        {showDeposit && <DepositModal key="deposit-modal" onClose={() => setShowDeposit(false)} onSuccess={() => setShowDeposit(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
