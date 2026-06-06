import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw, Smartphone, Landmark, Sliders, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    payment_upi_id: '',
    payment_bank_details: '',
    min_bet: '10',
    max_bet: '1000000',
    betting_close_minute: '50'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      const formatted = {};
      data.forEach(s => formatted[s.key] = s.value);
      setSettings(prev => ({ ...prev, ...formatted }));
    } catch (error) {
      toast.error('Failed to load system parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await api.post('/admin/settings', { settings: payload });
      toast.success('System configuration updated');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-24 text-center">
      <RefreshCw className="animate-spin mx-auto text-primary mb-4" size={32} />
      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Accessing Config...</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <Smartphone className="text-primary" size={20} />
              <h3 className="font-black text-sm uppercase tracking-widest">Financial Gateway</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Receiving UPI ID</label>
                <input
                  type="text"
                  value={settings.payment_upi_id}
                  onChange={(e) => setSettings({ ...settings, payment_upi_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                  placeholder="your-business@upi"
                />
                <p className="text-[9px] text-gray-600 ml-1">This UPI ID will be displayed to users in the Deposit modal.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bank Account Details (Optional)</label>
                <textarea
                  value={settings.payment_bank_details}
                  onChange={(e) => setSettings({ ...settings, payment_bank_details: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none h-24 resize-none"
                  placeholder="Acc: 1234567890&#10;IFSC: ABCD0123456&#10;Bank: HDFC"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 flex gap-4">
            <ShieldAlert className="text-red-500 shrink-0 mt-1" size={24} />
            <div>
              <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Platform Integrity</p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Changing these parameters affects all users instantly. Ensure your receiving accounts are active and monitored to prevent settlement delays.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <Sliders className="text-primary" size={20} />
              <h3 className="font-black text-sm uppercase tracking-widest">Game Parameters</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Min Wager (₹)</label>
                  <input
                    type="number"
                    value={settings.min_bet}
                    onChange={(e) => setSettings({ ...settings, min_bet: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Wager (₹)</label>
                  <input
                    type="number"
                    value={settings.max_bet}
                    onChange={(e) => setSettings({ ...settings, max_bet: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Betting Close Minute (0-59)</label>
                <input
                  type="number"
                  value={settings.betting_close_minute}
                  onChange={(e) => setSettings({ ...settings, betting_close_minute: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                />
                <p className="text-[9px] text-gray-600 ml-1">Example: 50 means betting stops at XX:50 every hour.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-3 shadow-2xl"
          >
            {saving ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={20} />
                <span>SYNCHRONIZE SETTINGS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SystemSettings;
