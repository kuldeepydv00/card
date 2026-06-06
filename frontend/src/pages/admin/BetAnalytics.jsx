import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { BarChart3, RefreshCw, Trophy, ChevronDown, ChevronUp, Clock, Database, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUIT_STYLE = {
  H: { label: '♥', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  D: { label: '♦', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  C: { label: '♣', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  S: { label: '♠', color: 'text-gray-300', bg: 'bg-white/10', border: 'border-white/20' },
};

const getSuit = (code) => {
  const suit = code?.slice(-1);
  return SUIT_STYLE[suit] || SUIT_STYLE['S'];
};

const SlotCard = ({ slot }) => {
  const [expanded, setExpanded] = useState(false);
  const maxAmount = Math.max(...slot.cards.map(c => c.totalAmount), 1);

  return (
    <motion.div
      layout
      className="glass-card rounded-[2rem] overflow-hidden border border-white/5"
    >
      {/* Slot Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-8 py-6 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Clock className="text-primary" size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
              {new Date(slot.hour_slot).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-lg font-black text-white">
              {new Date(slot.hour_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Bets</p>
            <p className="text-sm font-black text-gray-400">{slot.totalBets}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Pool Volume</p>
            <p className="text-sm font-black text-accent">₹{slot.totalVolume.toLocaleString()}</p>
          </div>
          {slot.is_processed && slot.winning_card && (
            <div className="text-center">
              <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1">Winner</p>
              <div className="w-12 h-14 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center font-black text-yellow-400 text-lg">
                {slot.winning_card}
              </div>
            </div>
          )}
          {!slot.is_processed && (
            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black rounded-full uppercase tracking-widest">
              Live
            </span>
          )}
          <div className="text-gray-500">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Card Breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-8 py-6">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Database size={12} /> Card-wise Bet Distribution
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {slot.cards.map((card, idx) => {
                  const style = getSuit(card._id);
                  const pct = Math.round((card.totalAmount / maxAmount) * 100);
                  const isWinner = card._id === slot.winning_card;
                  return (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`relative p-4 rounded-2xl border flex flex-col items-center gap-2 ${
                        isWinner
                          ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                          : `${style.bg} ${style.border}`
                      }`}
                    >
                      {isWinner && (
                        <Trophy size={10} className="absolute top-2 right-2 text-yellow-400" />
                      )}
                      <span className={`text-lg font-black ${isWinner ? 'text-yellow-400' : style.color}`}>
                        {card._id}
                      </span>
                      {/* Bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isWinner ? 'bg-yellow-400' : 'bg-primary/60'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={`text-[10px] font-black ${isWinner ? 'text-yellow-400' : 'text-accent'}`}>
                        ₹{card.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-gray-600">{card.betCount} bet{card.betCount !== 1 ? 's' : ''}</p>
                    </motion.div>
                  );
                })}
                {slot.cards.length === 0 && (
                  <p className="col-span-full text-center py-8 text-gray-600 text-sm italic">No bets placed in this slot</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BetAnalytics = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(24);

  useEffect(() => {
    fetchBreakdown();
  }, [limit]);

  const fetchBreakdown = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/bets/breakdown?limit=${limit}`);
      setSlots(data);
    } catch (error) {
      toast.error('Failed to load bet analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="text-primary" size={20} />
            <h2 className="text-xl font-black uppercase tracking-widest">Bet Analytics</h2>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Card-wise wager breakdown per hour slot
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-black text-white outline-none cursor-pointer hover:border-primary/30 transition-all"
          >
            <option value={12}>Last 12 Slots</option>
            <option value={24}>Last 24 Slots</option>
            <option value={48}>Last 48 Slots</option>
            <option value={100}>Last 100 Slots</option>
          </select>
          <button
            onClick={fetchBreakdown}
            className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all text-gray-500"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Slots */}
      {loading ? (
        <div className="py-32 flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Aggregating Data...</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] py-32 text-center border-none">
          <TrendingUp size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-600 font-medium">No betting data found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map(slot => (
            <SlotCard key={slot.hour_slot} slot={slot} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BetAnalytics;
