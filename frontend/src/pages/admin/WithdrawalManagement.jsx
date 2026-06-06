import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Landmark, Check, X, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [filter, searchQuery]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/withdrawals', {
        params: { status: filter, search: searchQuery }
      });
      setWithdrawals(data);
    } catch (error) {
      toast.error('Failed to load withdrawal requests');
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
      const { data } = await api.put(`/admin/withdrawals/${id}/${action}`, payload);
      toast.success(data.message);
      setRemarks('');
      fetchWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} withdrawal`);
    }
  };

  const filteredWithdrawals = withdrawals; // Filtering is now done on the backend

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card rounded-[2rem] p-6 flex justify-between items-center border-white/5">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <Landmark className="text-primary" size={24} /> Withdrawal Requests
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex bg-background border border-white/5 rounded-xl p-1">
            <input 
              type="text" 
              placeholder="Search user, email or phone..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
              className="bg-transparent border-none outline-none px-4 text-sm text-white w-48 focus:w-64 transition-all"
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
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  filter === f ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/20' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
            <button onClick={fetchWithdrawals} className="p-2 ml-2 text-gray-500 hover:text-white border border-white/5 bg-white/5 rounded-xl">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                <th className="px-10 py-6">Operative</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Details</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {loading ? (
                <tr><td colSpan="5" className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest">Loading...</td></tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr><td colSpan="5" className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest">No requests found</td></tr>
              ) : (
                filteredWithdrawals.map(w => (
                  <tr key={w._id} className="hover:bg-white/[0.01]">
                    <td className="px-10 py-6 font-bold">{w.user_id?.username}</td>
                    <td className="px-10 py-6 font-black text-red-400">₹{w.amount.toFixed(2)}</td>
                    <td className="px-10 py-6 font-mono text-xs">
                      {w.account_details?.upi_id || `${w.account_details?.bank_account?.account_number} | IFSC: ${w.account_details?.bank_account?.ifsc} (${w.account_details?.bank_account?.beneficiary_name})`}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        w.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex gap-2 justify-end items-center">
                          <input 
                            type="text" 
                            placeholder="Remarks (if rejecting)" 
                            onChange={e => setRemarks(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none"
                          />
                          <button onClick={() => handleAction(w._id, 'approve')} className="p-2 bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/40 rounded-lg">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleAction(w._id, 'reject')} className="p-2 bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/40 rounded-lg">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-xs">{w.admin_remarks || 'Processed'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default WithdrawalManagement;
