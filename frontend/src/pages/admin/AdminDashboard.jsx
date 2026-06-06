import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import HourlyResults from './HourlyResults';
import BetsExplorer from './BetsExplorer';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import BetAnalytics from './BetAnalytics';
import WithdrawalManagement from './WithdrawalManagement';
import DepositManagement from './DepositManagement';
import Reports from './Reports';
import CommandCenter from './CommandCenter';
import { LayoutDashboard, Clock, Database, Users, Check, X as XIcon, ChevronRight, ShieldCheck, Activity, Settings, BarChart3, Landmark, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBets: 0, totalVolume: 0 });
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchWithdrawals();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals/pending');
      setPendingWithdrawals(data);
    } catch (error) {
      console.error('Failed to fetch withdrawals');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/withdrawals/${id}/approve`);
      toast.success('Capital release approved');
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Enter rejection reason:');
    if (remarks === null) return;
    try {
      await api.put(`/admin/withdrawals/${id}/reject`, { remarks });
      toast.success('Request declined');
      fetchWithdrawals();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
    { id: 'results', label: 'Game Sessions', icon: Clock },
    { id: 'analytics', label: 'Bet Analytics', icon: BarChart3 },
    { id: 'bets', label: 'Wager Logs', icon: Database },
    { id: 'deposits', label: 'Inbound Deposits', icon: Landmark },
    { id: 'withdrawals', label: 'Outbound Payouts', icon: Landmark },
    { id: 'users', label: 'Operatives', icon: Users },
    { id: 'settings', label: 'Financial Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="glass-card rounded-[2.5rem] p-4 sticky top-28 border-none">
              <div className="p-6 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-primary" size={20} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin Authorization</span>
                </div>
                <h2 className="text-xl font-black text-white">System Control</h2>
              </div>
              
              <div className="flex overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 w-auto lg:w-full flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        isActive 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 bg-white/[0.02] lg:bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={18} />
                        {tab.label}
                      </div>
                      <ChevronRight size={14} className={`hidden lg:block ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:block mt-8 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-green-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Server Status</span>
                </div>
                <p className="text-[10px] text-gray-600 font-bold">NODE: STABLE</p>
                <p className="text-[10px] text-gray-600 font-bold">DB: CONNECTED</p>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <CommandCenter stats={stats} />

                  <div className="glass-card rounded-[2.5rem] overflow-hidden border-none">
                    <div className="px-10 py-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-black text-sm uppercase tracking-widest">Pending Settlements</h3>
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20">
                        {pendingWithdrawals.length} ACTIONS REQUIRED
                      </span>
                    </div>
                    <div className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                              <th className="px-10 py-6">Operative</th>
                              <th className="px-10 py-6">Equity</th>
                              <th className="px-10 py-6">Destination</th>
                              <th className="px-10 py-6 text-right">Control</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {pendingWithdrawals.map((req) => (
                              <tr key={req._id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-10 py-6 font-black text-white text-sm">{req.user_id.username}</td>
                                <td className="px-10 py-6 font-black text-accent text-lg">₹{req.amount.toLocaleString()}</td>
                                <td className="px-10 py-6 text-[10px] text-gray-500 font-bold font-mono">
                                  {req.account_details.upi_id || req.account_details.bank_account.account_number}
                                </td>
                                <td className="px-10 py-6">
                                  <div className="flex justify-end gap-3">
                                    <button 
                                      onClick={() => handleApprove(req._id)} 
                                      className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                                      title="Approve Release"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleReject(req._id)} 
                                      className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                      title="Decline Release"
                                    >
                                      <XIcon size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {pendingWithdrawals.length === 0 && (
                              <tr><td colSpan="4" className="py-24 text-center text-gray-600 italic font-medium">All settlement queues are empty</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'results' && <HourlyResults />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'analytics' && <BetAnalytics />}
              {activeTab === 'bets' && <BetsExplorer />}
              {activeTab === 'deposits' && <DepositManagement />}
              {activeTab === 'withdrawals' && <WithdrawalManagement />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'settings' && <SystemSettings />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
