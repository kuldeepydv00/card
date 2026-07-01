import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, ArrowRight, Zap, Smartphone, CheckCircle2, Copy, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Helmet } from 'react-helmet-async';

const schema = z.object({
  amount: z.number().min(100, "Minimum deposit is ₹100"),
  utrNumber: z.string().optional()
});

const DepositPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [method, setMethod] = useState('manual');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 500 }
  });

  const amount = watch('amount');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/config/payment');
      setPaymentConfig(data);
    } catch (error) {
      console.error('Failed to load payment config');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data) => {
    if (method === 'manual') {
      if (!data.utrNumber || data.utrNumber.length < 5) {
        toast.error('Please enter a valid UTR / Transaction ID');
        return;
      }
      setIsProcessing(true);
      try {
        await api.post('/deposit/manual-request', { amount: data.amount, utrNumber: data.utrNumber });
        toast.success('Deposit request submitted! Please wait for admin approval.');
        navigate('/wallet');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to submit deposit request');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      const { data: order } = await api.post('/deposit/create-order', { amount: data.amount });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "50xcards",
        description: "Wallet Credit Inbound",
        order_id: order.id,
        handler: function (response) {
          toast.success('Capital injection successful!');
          navigate('/wallet');
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#6366f1" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Transaction initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Deposit Funds | 50xcards</title>
      </Helmet>
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/wallet" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase">REPLENISH <span className="text-primary">WALLET</span></h1>
            <p className="text-gray-500 text-xs mt-1">Select your preferred injection method</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 rounded-3xl"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Amount to Inject</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-600 group-focus-within:text-primary transition-colors">₹</span>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-10 text-xl font-black focus:border-primary/50 outline-none transition-all tracking-tighter"
                  placeholder="0"
                  autoFocus
                />
              </div>
              {errors.amount && <p className="text-red-500 text-[10px] mt-2 ml-1">{errors.amount.message}</p>}
            </div>

            <AnimatePresence mode="wait">
              {method === 'manual' ? (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 mb-8"
                >
                  <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Direct UPI ID</span>
                      <div className="flex items-center justify-between bg-background p-4 rounded-2xl border border-white/5">
                        <span className="font-black text-white text-sm truncate mr-4">
                          {paymentConfig?.payment_upi_id || 'NOT_CONFIGURED'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => copyToClipboard(paymentConfig?.payment_upi_id)}
                          className="p-2 hover:bg-white/5 rounded-lg text-primary transition-all"
                        >
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    {paymentConfig?.payment_upi_id && amount > 0 && !errors.amount && (
                      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-4 border-white/10 mt-4">
                        <p className="text-black font-black text-xs uppercase tracking-widest mb-4">Scan to Pay ₹{amount}</p>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${paymentConfig.payment_upi_id}&pn=Admin&am=${amount}&cu=INR`)}`} 
                          alt="UPI QR Code" 
                          className="w-32 h-32"
                        />
                      </div>
                    )}

                    {paymentConfig?.payment_bank_details && (
                      <div className="mt-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Bank Details</span>
                        <div className="bg-background p-4 rounded-2xl border border-white/5 text-[10px] font-bold text-gray-400 whitespace-pre-line leading-relaxed">
                          {paymentConfig.payment_bank_details}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10 flex items-start gap-3">
                    <Zap className="text-yellow-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      Manual deposits require verification. Transfer the amount to the UPI ID above, then enter the UTR/Transaction ID below.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">12-Digit UTR / Transaction ID</label>
                    <input
                      type="text"
                      {...register('utrNumber')}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
                      placeholder="e.g. 123456789012"
                    />
                    {errors.utrNumber && <p className="text-red-500 text-[10px] mt-2 ml-1">{errors.utrNumber.message}</p>}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="razorpay"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-3 gap-3 mb-8"
                >
                  {[500, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setValue('amount', val)}
                      className={`py-4 rounded-2xl text-xs font-black transition-all border ${
                        amount === val ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      +₹{val.toLocaleString()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full btn-primary py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {method === 'manual' ? <Smartphone size={20} /> : <CreditCard size={20} />}
                  <span>{method === 'manual' ? 'I HAVE SENT THE MONEY' : 'INITIATE PAYMENT'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default DepositPage;
