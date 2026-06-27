import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { ArrowDownToLine, Check, X, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const DepositManagement = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, [filter, searchQuery]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/deposits', {
        params: { status: filter, search: searchQuery }
      });
      setDeposits(data);
    } catch (error) {
      toast.error('Failed to load deposit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'reject' && !remarks) {
        toast.error('Remarks are required for rejection');
        return;
      }
      
      const payload = action === 'reject' ? { remarks } : {};
      const { data } = await api.put(`/admin/deposits/${id}/${action}`, payload);
      toast.success(data.message);
      setRemarks('');
      fetchDeposits();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} deposit`);
    }
  };

  const filteredDeposits = deposits; // Filtering is now done on the backend

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card rounded-[2rem] p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-white/5">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <ArrowDownToLine className="text-green-500" size={24} /> Manual Deposits
        </h2>
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-background border border-white/5 rounded-xl p-1 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search user, email or phone..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
              className="bg-transparent border-none outline-none px-4 text-sm text-white w-full sm:w-48 sm:focus:w-64 transition-all"
            />
            <button 
              onClick={() => setSearchQuery(searchInput)}
              className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
            >
              SEARCH
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
            <button onClick={fetchDeposits} className="p-2 ml-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all">
              <RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredDeposits.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-20 flex flex-col items-center justify-center border-white/5">
          <Clock size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest">No Deposit Requests</h3>
          <p className="text-gray-500 mt-2 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDeposits.map((req) => (
            <div key={req._id} className="glass-card rounded-[2rem] p-6 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Operative</span>
                    <div className="font-bold text-white">{req.user_id?.username || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{req.user_id?.email}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Amount</span>
                    <div className="text-2xl font-black text-green-400">₹{req.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Transaction ID / UTR</span>
                  <div className="font-mono text-sm text-yellow-400 select-all">{req.utr_number}</div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(req._id, 'approve')}
                      className="w-full py-3 px-4 bg-green-500/10 text-green-500 hover:bg-green-500 text-sm font-black tracking-widest rounded-xl transition-all border border-green-500/20 hover:text-white flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> APPROVE
                    </button>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Rejection Reason"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs focus:border-red-500/50 outline-none"
                      />
                      <button
                        onClick={() => handleAction(req._id, 'reject')}
                        className="py-3 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 text-sm font-black tracking-widest rounded-xl transition-all border border-red-500/20 hover:text-white flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`py-3 px-6 rounded-xl font-black text-xs tracking-widest text-center border ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {req.status.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DepositManagement;
