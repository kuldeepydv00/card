import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Clock, Edit3, AlertCircle, TrendingUp, Search, Info, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HourlyResults = () => {
  const [results, setResults] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [aggregation, setAggregation] = useState([]);
  const [manualWinner, setManualWinner] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results/latest?limit=500');
      setResults(data);
    } catch (error) {
      toast.error('Sector data retrieval failed');
    }
  };

  const openOverrideModal = async (slot) => {
    setSelectedSlot(slot);
    try {
      const { data } = await api.get(`/admin/hour/${slot}/bet-aggregation`);
      setAggregation(data);
      if (data.length > 0) setManualWinner(data[0]._id);
    } catch (error) {
      toast.error('Aggregation telemetry failed');
    }
  };

  const handleOverride = async () => {
    try {
      await api.post('/admin/override-result', {
        hourSlot: selectedSlot,
        winningCard: manualWinner
      });
      toast.success('System override successful: Results synchronized');
      setSelectedSlot(null);
      fetchResults();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Override rejected by system');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-none">
        <div className="px-10 py-6 bg-white/[0.02] border-b border-white/5">
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
            <Clock className="text-primary" size={18} /> Temporal Audit Logs
          </h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                  <th className="px-10 py-6">Session Slot</th>
                  <th className="px-10 py-6">Declared Winner</th>
                  <th className="px-10 py-6">Total Volume</th>
                  <th className="px-10 py-6">Origin</th>
                  <th className="px-10 py-6 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((res) => (
                  <tr key={res._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-10 py-6 flex items-center gap-4">
                      <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center border border-white/5 text-gray-500">
                        <Clock size={14} />
                      </div>
                      <span className="text-sm font-black text-white">{new Date(res.hour_slot).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="w-10 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black text-accent text-lg">
                        {res.winning_card || 'NULL'}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-black text-gray-300">₹{res.total_bet_volume.toLocaleString()}</td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                        res.declared_by === 'auto' 
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                          : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      }`}>
                        {res.declared_by}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {!res.is_processed && (
                        <button
                          onClick={() => openOverrideModal(res.hour_slot)}
                          className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                        >
                          MANUAL OVERRIDE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-4xl p-10 rounded-[3rem] relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black uppercase">SYSTEM <span className="text-primary">OVERRIDE</span></h3>
                  <p className="text-gray-500 text-sm mt-1">Manual synchronization for session: {new Date(selectedSlot).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
                  <XIcon size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Aggregated Telemetry</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {aggregation.map((item) => (
                      <div key={item._id} className="flex justify-between items-center p-5 bg-background rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black text-white">
                            {item._id}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-600 block uppercase">TOTAL WAGERS</span>
                            <span className="font-black text-accent text-lg">₹{item.total.toLocaleString()}</span>
                          </div>
                        </div>
                        <TrendingUp size={16} className="text-gray-800" />
                      </div>
                    ))}
                    {aggregation.length === 0 && (
                      <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                        <p className="text-gray-600 italic text-sm">No wager data detected for this slot</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Declaration Target</h4>
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        value={manualWinner}
                        onChange={(e) => setManualWinner(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm font-black text-white focus:border-primary/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0b0e14]">SELECT TARGET CARD</option>
                        {aggregation.map(a => <option key={a._id} value={a._id} className="bg-[#0b0e14]">{a._id} — ₹{a.total.toLocaleString()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/10 flex gap-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Critical Action</p>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Initiating an override will immediately trigger the settlement process for all operatives who wagered on the selected target. This action bypasses autonomous verification and is irreversible.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      ABORT
                    </button>
                    <button
                      onClick={handleOverride}
                      disabled={!manualWinner}
                      className="flex-2 py-5 bg-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-20"
                    >
                      EXECUTE OVERRIDE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HourlyResults;
