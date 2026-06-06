import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  User, Mail, Phone, Wallet, Search, Filter, X, 
  ArrowUpRight, ArrowDownLeft, Dices, Clock, Calendar,
  TrendingUp, TrendingDown, Shield, ShieldCheck, CheckCircle2,
  XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAdjustAmount, setWalletAdjustAmount] = useState('');
  const [walletAdjustAction, setWalletAdjustAction] = useState('credit');
  const [walletAdjustRemarks, setWalletAdjustRemarks] = useState('');
  const [adjustingWallet, setAdjustingWallet] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { search: search || undefined }
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch operatives directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    setActiveTab('overview');
    try {
      const { data } = await api.get(`/admin/users/${userId}/details`);
      setUserDetails(data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to retrieve intelligence log');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const handleToggleBlock = async () => {
    try {
      const { data } = await api.post(`/admin/users/${selectedUser._id}/block`);
      toast.success(data.message);
      fetchUserDetails(selectedUser._id);
      fetchUsers(); // refresh the background table too
    } catch (error) {
      toast.error('Failed to update operative status');
    }
  };

  const handleAdjustWallet = async () => {
    if (!walletAdjustAmount || isNaN(walletAdjustAmount) || walletAdjustAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAdjustingWallet(true);
    try {
      const { data } = await api.post(`/admin/users/${selectedUser._id}/wallet`, {
        amount: walletAdjustAmount,
        action: walletAdjustAction,
        remarks: walletAdjustRemarks
      });
      toast.success(data.message);
      setWalletModalOpen(false);
      setWalletAdjustAmount('');
      setWalletAdjustRemarks('');
      fetchUserDetails(selectedUser._id);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to adjust wallet balance');
    } finally {
      setAdjustingWallet(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  // Filtered users for local filtering by engagement status
  const filteredUsers = users.filter(u => {
    if (statusFilter === 'all') return true;
    return u.engagement_status === statusFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'daily':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'weekly':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'monthly':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'inactive':
      default:
        return 'bg-gray-500/10 text-gray-400 border-white/5';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Controls */}
      <div className="glass-card rounded-[2rem] p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-white/5">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-3.5 pl-12 text-xs text-white outline-none transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-start md:justify-end">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-1.5">
            <Filter size={12} /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Users' },
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'inactive', label: 'Inactive' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/20'
                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / List */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl">
        <div className="px-10 py-6 bg-white/[0.01] border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-widest">Registered Operatives</h3>
          <button 
            onClick={fetchUsers}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/5"
            title="Refresh database list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && filteredUsers.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Accessing Central Registry...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-bold text-gray-400">No matching operatives found</p>
              <p className="text-xs text-gray-600 mt-1">Refine your search parameters or query keywords</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-10 py-6">Operative</th>
                  <th className="px-10 py-6">Contact Channels</th>
                  <th className="px-10 py-6">Wallet Balance</th>
                  <th className="px-10 py-6">Registration Date</th>
                  <th className="px-10 py-6 text-right">Engagement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    onClick={() => handleUserClick(user)}
                    className="hover:bg-white/[0.01] transition-all cursor-pointer group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                          <User size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-black text-white text-sm group-hover:text-primary transition-colors">
                            {user.username}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                            ID: ...{user._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Mail size={12} className="text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone size={12} className="text-gray-500" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-gray-600 italic">
                            <Phone size={12} className="text-gray-700" />
                            <span>No phone logged</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-accent" />
                        <span className="font-black text-accent text-base">₹{user.wallet_balance.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-xs text-gray-400 font-mono">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadgeClass(user.engagement_status)}`}>
                        {user.engagement_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal (Drawer) */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
            />
            
            {/* Modal content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full md:max-w-2xl bg-background/95 backdrop-blur-md border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase text-white flex items-center gap-4">
                      {userDetails?.user?.username || 'Loading...'}
                      {userDetails?.user && (
                        <span className={`text-[10px] px-3 py-1 rounded-full border ${userDetails.user.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {userDetails.user.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 font-mono">{userDetails?.user?._id}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  {userDetails?.user && (
                    <>
                      <button 
                        onClick={() => setWalletModalOpen(true)}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white hover:border-primary/50 transition-all uppercase tracking-widest"
                      >
                        Adjust Wallet
                      </button>
                      <button 
                        onClick={handleToggleBlock}
                        className={`px-6 py-3 rounded-xl border text-xs font-black transition-all uppercase tracking-widest ${
                          userDetails.user.is_active 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                            : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {userDetails.user.is_active ? 'Suspend Account' : 'Reactivate Account'}
                      </button>
                    </>
                  )}
                  <button onClick={handleCloseModal} className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {detailsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Accessing Vault Logs...</p>
                </div>
              ) : !userDetails ? (
                <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
                  <AlertCircle size={32} className="mb-2 opacity-30" />
                  <span>Failed to retrieve intelligence log</span>
                </div>
              ) : (
                <div className="flex-1 p-8 space-y-8">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Liquid Capital</span>
                      <h4 className="text-2xl font-black text-accent mt-2">₹{userDetails.user.wallet_balance.toFixed(2)}</h4>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Wagers</span>
                      <h4 className="text-2xl font-black text-white mt-2">{userDetails.wagers.length} sessions</h4>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Join Timestamp</span>
                      <h4 className="text-xs font-bold text-gray-300 mt-3 font-mono">{formatDate(userDetails.user.created_at)}</h4>
                    </div>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex gap-2 border-b border-white/5 pb-2">
                    {[
                      { id: 'overview', label: 'Overview', icon: User },
                      { id: 'deposits', label: 'Deposits', icon: ArrowDownLeft },
                      { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
                      { id: 'wagers', label: 'Wager Logs', icon: Dices }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                            isActive
                              ? 'bg-primary border-primary/20 text-white shadow-lg'
                              : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={14} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Panels */}
                  <div>
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Operative Profile</h4>
                          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Username</span>
                              <p className="text-white font-semibold mt-0.5">{userDetails.user.username}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Authorization Node</span>
                              <p className="text-white font-semibold mt-0.5 capitalize">{userDetails.user.role}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Email Identity</span>
                              <p className="text-white font-semibold mt-0.5 break-all">{userDetails.user.email}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Registered Contact</span>
                              <p className="text-white font-semibold mt-0.5 font-mono">{userDetails.user.phone || 'None configured'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Operational Status</span>
                              <p className="text-white font-semibold mt-0.5 flex items-center gap-1.5">
                                {userDetails.user.is_active ? (
                                  <>
                                    <CheckCircle2 size={14} className="text-green-500" />
                                    <span className="text-green-400 text-xs font-black uppercase">ACTIVE</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} className="text-red-500" />
                                    <span className="text-red-400 text-xs font-black uppercase">SUSPENDED</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Engagement Rating</span>
                              <p className="text-white font-semibold mt-0.5 uppercase font-mono text-xs">{userDetails.user.engagement_status}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity summary */}
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Financial Aggregates</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">Total Deposit Value</span>
                              <p className="text-xl font-black text-accent mt-1">
                                ₹{userDetails.deposits.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">Net Wager Volume</span>
                              <p className="text-xl font-black text-white mt-1">
                                ₹{userDetails.wagers.reduce((acc, w) => acc + w.bet_amount, 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'deposits' && (
                      <div className="space-y-4">
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                  <th className="px-6 py-4">Transaction ID</th>
                                  <th className="px-6 py-4">Value</th>
                                  <th className="px-6 py-4">Timestamp</th>
                                  <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-xs">
                                {userDetails.deposits.map((dep) => (
                                  <tr key={dep._id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-400">
                                      {dep.reference_id ? dep.reference_id.slice(-10) : dep._id.slice(-10)}
                                    </td>
                                    <td className="px-6 py-4 font-black text-green-400">₹{dep.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-mono text-gray-500">{formatDate(dep.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                        {dep.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                {userDetails.deposits.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-500 italic">No deposit logs registered</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Payment Gateway Logs */}
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Payment Gateway Logs (Razorpay)</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                  <th className="px-6 py-4">Order ID</th>
                                  <th className="px-6 py-4">Amount</th>
                                  <th className="px-6 py-4">Gateway Status</th>
                                  <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-xs text-gray-400">
                                {userDetails.payments.map((p) => (
                                  <tr key={p._id}>
                                    <td className="px-6 py-4 font-mono font-bold">{p.razorpay_order_id || p.gateway_txn_id.slice(-10)}</td>
                                    <td className="px-6 py-4 font-bold text-white">₹{p.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        p.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                      }`}>
                                        {p.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500">{formatDate(p.created_at)}</td>
                                  </tr>
                                ))}
                                {userDetails.payments.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500 italic">No gateway logs</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'withdrawals' && (
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Requested At</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                              {userDetails.withdrawals.map((w) => (
                                <tr key={w._id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="px-6 py-4 font-mono text-gray-400">
                                    {w.account_details.upi_id || `${w.account_details.bank_account?.account_number} (${w.account_details.bank_account?.beneficiary_name})`}
                                  </td>
                                  <td className="px-6 py-4 font-black text-red-400">₹{w.amount.toFixed(2)}</td>
                                  <td className="px-6 py-4 font-mono text-gray-500">{formatDate(w.requested_at)}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                      w.status === 'approved' || w.status === 'processed'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : w.status === 'pending'
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                      {w.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-500 italic max-w-[150px] truncate" title={w.admin_remarks}>
                                    {w.admin_remarks || 'None'}
                                  </td>
                                </tr>
                              ))}
                              {userDetails.withdrawals.length === 0 && (
                                  <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500 italic">No withdrawal requests filed</td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'wagers' && (
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-4">Hour Slot</th>
                                <th className="px-6 py-4">Card Chosen</th>
                                <th className="px-6 py-4">Bet Amount</th>
                                <th className="px-6 py-4">Win Result</th>
                                <th className="px-6 py-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                              {userDetails.wagers.map((wager) => {
                                const profit = wager.win_amount - wager.bet_amount;
                                const isWin = profit > 0;
                                return (
                                  <tr key={wager._id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-500">
                                      {formatDate(wager.hour_slot)}
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="font-black text-white bg-white/5 px-2.5 py-1 rounded-md border border-white/5 font-mono">
                                        {wager.card_code}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">₹{wager.bet_amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                      {wager.status === 'settled' ? (
                                        <div className="flex items-center gap-1">
                                          {isWin ? (
                                            <>
                                              <TrendingUp size={12} className="text-green-500" />
                                              <span className="text-green-400 font-bold">₹{wager.win_amount.toFixed(2)} (+₹{profit.toFixed(2)})</span>
                                            </>
                                          ) : (
                                            <>
                                              <TrendingDown size={12} className="text-red-500" />
                                              <span className="text-red-400 font-bold">₹0.00 (-₹{wager.bet_amount.toFixed(2)})</span>
                                            </>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-500 font-bold">Pending session</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        wager.status === 'settled' ? 'bg-gray-500/10 text-gray-400 border border-white/5' : 'bg-primary/10 text-primary border border-primary/20'
                                      }`}>
                                        {wager.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                              {userDetails.wagers.length === 0 && (
                                  <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500 italic">No wagers registered</td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Wallet Adjustment Modal */}
      <AnimatePresence>
        {walletModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f1219] border border-white/10 w-full max-w-md p-8 rounded-[2rem] relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-white">
                  <Wallet className="text-primary" size={20} /> Adjust Wallet
                </h3>
                <button onClick={() => setWalletModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Adjustment Type</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setWalletAdjustAction('credit')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        walletAdjustAction === 'credit' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Credit (+)
                    </button>
                    <button 
                      onClick={() => setWalletAdjustAction('deduct')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        walletAdjustAction === 'deduct' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Deduct (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Amount</label>
                  <input
                    type="number"
                    value={walletAdjustAmount}
                    onChange={(e) => setWalletAdjustAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    className="w-full bg-black/40 border border-white/10 focus:border-primary/50 rounded-xl p-4 text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Remarks</label>
                  <input
                    type="text"
                    value={walletAdjustRemarks}
                    onChange={(e) => setWalletAdjustRemarks(e.target.value)}
                    placeholder="Reason for adjustment"
                    className="w-full bg-black/40 border border-white/10 focus:border-primary/50 rounded-xl p-4 text-sm text-gray-300 outline-none"
                  />
                </div>

                <button
                  onClick={handleAdjustWallet}
                  disabled={adjustingWallet}
                  className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adjustingWallet ? <RefreshCw className="animate-spin" size={18} /> : 'Confirm Adjustment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
