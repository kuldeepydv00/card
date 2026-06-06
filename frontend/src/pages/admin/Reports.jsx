import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Download, TrendingUp, TrendingDown, IndianRupee, RefreshCw, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (period !== 'custom') {
      fetchReport();
    }
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports', { 
        params: { period, customStartDate, customEndDate } 
      });
      setReport(data);
    } catch (error) {
      toast.error('Failed to load financial report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!report) return;

    const headers = ['Metric,Value'];
    const rows = [
      `Period,${report.period.toUpperCase()}`,
      `Start Date,${new Date(report.startDate).toLocaleDateString()}`,
      `End Date,${new Date(report.endDate).toLocaleDateString()}`,
      `Total Bet Volume,${report.bets.volume}`,
      `Total Payouts,${report.bets.payouts}`,
      `Gross Gaming Revenue (GGR),${report.bets.grossGamingRevenue}`,
      `Total Bets Count,${report.bets.count}`,
      `Total Deposit Amount,${report.deposits.amount}`,
      `Total Deposit Count,${report.deposits.count}`,
      `Total Withdrawal Amount,${report.withdrawals.amount}`,
      `Total Withdrawal Count,${report.withdrawals.count}`
    ];

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cardgame_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center border-white/5 gap-4">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <FileText className="text-primary" size={24} /> Financial Reports
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
            {['daily', 'weekly', 'monthly', 'custom'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="datetime-local" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
              />
              <span className="text-gray-500 text-xs">to</span>
              <input 
                type="datetime-local" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
              />
              <button 
                onClick={fetchReport}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-primary/30 transition-all"
              >
                Apply
              </button>
            </div>
          )}

          <button 
            onClick={fetchReport} 
            className="p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            title="Refresh Report"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
          
          <button 
            onClick={downloadCSV}
            disabled={!report || loading}
            className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {!loading && report ? (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border-white/5 text-sm text-gray-400 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            Reporting Period: <span className="text-white font-bold">{new Date(report.startDate).toLocaleString()}</span> to <span className="text-white font-bold">{new Date(report.endDate).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gaming Revenue */}
            <div className="glass-card rounded-[2rem] p-8 border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform">
                <IndianRupee size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary" size={16} /> Gaming Performance
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Gross Gaming Revenue (GGR)</p>
                  <p className={`text-4xl font-black mt-1 ${report.bets.grossGamingRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{report.bets.grossGamingRevenue.toLocaleString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Wagered</p>
                    <p className="text-xl font-black text-white mt-1">₹{report.bets.volume.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{report.bets.count} sessions</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Total Payouts</p>
                    <p className="text-xl font-black text-accent mt-1">₹{report.bets.payouts.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capital Flow */}
            <div className="glass-card rounded-[2rem] p-8 border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform">
                <TrendingDown size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <TrendingDown className="text-primary" size={16} /> Capital Flow
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full content-start">
                <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Inflow (Deposits)</p>
                  <p className="text-2xl font-black text-green-400 mt-2">₹{report.deposits.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600 mt-2">{report.deposits.count} transactions</p>
                </div>
                
                <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Outflow (Withdrawals)</p>
                  <p className="text-2xl font-black text-red-400 mt-2">₹{report.withdrawals.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600 mt-2">{report.withdrawals.count} approved</p>
                </div>
                
                <div className="col-span-1 sm:col-span-2 bg-black/20 rounded-2xl p-6 border border-white/5 flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Net Flow</span>
                  <span className={`text-xl font-black ${report.deposits.amount - report.withdrawals.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{(report.deposits.amount - report.withdrawals.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
          <RefreshCw className="animate-spin text-primary mb-4" size={32} />
          <p className="text-sm font-bold uppercase tracking-widest">Generating Financial Intelligence...</p>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
