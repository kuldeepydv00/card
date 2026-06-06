import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Download, Database, User, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const BetsExplorer = () => {
  const [bets, setBets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    setLoading(true);
    try {
      // Use admin breakdown endpoint which returns all bets across all rounds
      const { data } = await api.get('/admin/bets/breakdown?limit=48');
      // Flatten all bets from all slots into one list
      const allBets = [];
      data.forEach(slot => {
        if (slot.cards) {
          slot.cards.forEach(card => {
            allBets.push({
              _id: `${slot.hour_slot}_${card._id}`,
              hour_slot: slot.hour_slot,
              card_code: card._id,
              bet_amount: card.totalAmount,
              bet_count: card.betCount,
              winning_card: slot.winning_card,
              is_processed: slot.is_processed
            });
          });
        }
      });
      setBets(allBets);
    } catch (error) {
      console.error('Data retrieval failed', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['User', 'Hour Slot', 'Card', 'Amount', 'Win Amount', 'Status'];
    const rows = bets.map(b => [
      b.user_id,
      b.hour_slot,
      b.card_code,
      b.bet_amount,
      b.win_amount,
      b.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "elite_wager_logs.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-[500px] group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by operative ID or session slot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-5 pl-16 text-sm font-bold text-white focus:border-primary/50 outline-none transition-all"
          />
        </div>
        
        <button
          onClick={exportCSV}
          className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/5 rounded-[2rem] hover:border-primary/50 transition-all text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white group"
        >
          <Download size={18} className="text-primary group-hover:scale-110 transition-transform" /> 
          Export Telemetry (.csv)
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-none">
        <div className="px-10 py-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
          <Database size={18} className="text-primary" />
          <h3 className="font-black text-sm uppercase tracking-widest">Global Wager Manifest</h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6">Operative</th>
                  <th className="px-10 py-6">Target</th>
                  <th className="px-10 py-6">Stake</th>
                  <th className="px-10 py-6">Outcome</th>
                  <th className="px-10 py-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest">Decoding Logs...</td></tr>
                ) : (
                  bets
                    .filter(b =>
                      !search ||
                      b.card_code.toLowerCase().includes(search.toLowerCase()) ||
                      new Date(b.hour_slot).toLocaleString().includes(search)
                    )
                    .map((bet) => (
                    <tr key={bet._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-10 py-6 text-xs text-gray-500 font-bold font-mono">
                        {new Date(bet.hour_slot).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                            <Target size={14} />
                          </div>
                          <span className="text-xs font-black text-gray-300">{bet.bet_count} player{bet.bet_count !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-black text-white">
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">{bet.card_code}</span>
                      </td>
                      <td className="px-10 py-6 font-black text-white text-sm">₹{bet.bet_amount.toLocaleString()}</td>
                      <td className="px-10 py-6">
                        {bet.is_processed ? (
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            bet.card_code === bet.winning_card
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {bet.card_code === bet.winning_card ? 'WINNER' : 'LOSS'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            LIVE
                          </span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-accent text-lg">
                        {bet.card_code === bet.winning_card ? `+₹${(bet.bet_amount * 50).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BetsExplorer;
