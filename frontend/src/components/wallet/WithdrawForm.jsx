import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Landmark, ArrowRight, ShieldCheck, Smartphone, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  amount: z.number().min(100, "Minimum withdrawal is ₹100"),
  upi_id: z.string().optional().or(z.literal('')),
  bank_account: z.object({
    account_number: z.string().optional().or(z.literal('')),
    ifsc: z.string().optional().or(z.literal('')),
    beneficiary_name: z.string().optional().or(z.literal(''))
  }).optional()
});

const WithdrawForm = ({ balance, onSuccess }) => {
  const [method, setMethod] = useState('upi');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    if (data.amount > balance) {
      toast.error('Capital deficit detected: Insufficient balance');
      return;
    }

    if (method === 'upi' && (!data.upi_id || data.upi_id.length < 3)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    if (method === 'bank') {
      if (!data.bank_account?.account_number || data.bank_account.account_number.length < 8) {
        toast.error('Please enter a valid account number (min 8 digits)');
        return;
      }
      if (!data.bank_account?.ifsc || data.bank_account.ifsc.length !== 11) {
        toast.error('IFSC must be exactly 11 characters');
        return;
      }
      if (!data.bank_account?.beneficiary_name || data.bank_account.beneficiary_name.length < 3) {
        toast.error('Please enter a valid beneficiary name');
        return;
      }
    }

    // Structure payload correctly for backend
    const payload = {
      amount: data.amount,
      account_details: {}
    };

    if (method === 'upi' && data.upi_id) {
      payload.account_details.upi_id = data.upi_id;
    } else if (method === 'bank' && data.bank_account) {
      payload.account_details.bank_account = data.bank_account;
    }

    try {
      await api.post('/withdraw/request', payload);
      toast.success('Withdrawal request submitted for audit');
      reset();
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Request failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col justify-between gap-3">
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMethod('upi')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-black text-[10px] tracking-widest uppercase ${
            method === 'upi' 
              ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
              : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
          }`}
        >
          <Smartphone size={16} /> UPI PAY
        </button>
        <button
          type="button"
          onClick={() => setMethod('bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-black text-[10px] tracking-widest uppercase ${
            method === 'bank' 
              ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
              : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
          }`}
        >
          <Building2 size={16} /> BANK TRANSFER
        </button>
      </div>

      <div className="flex flex-col gap-3 shrink-0">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Withdrawal Amount</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-600 group-focus-within:text-primary transition-colors">₹</span>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="w-full bg-white/5 border border-white/5 rounded-xl p-3 pl-10 text-lg font-black focus:border-primary/50 outline-none"
              placeholder="Min 100"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.amount.message}</p>}
        </div>

        <AnimatePresence mode="wait">
          {method === 'upi' ? (
            <motion.div 
              key="upi"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-1"
            >
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">UPI Identifier</label>
              <input
                type="text"
                {...register('upi_id')}
                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-bold focus:border-primary/50 outline-none"
                placeholder="username@bank"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="bank"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Number</label>
                <input
                  type="text"
                  {...register('bank_account.account_number')}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-bold focus:border-primary/50 outline-none"
                  placeholder="000000000000"
                />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">IFSC Code</label>
                  <input
                    type="text"
                    {...register('bank_account.ifsc')}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-bold focus:border-primary/50 outline-none uppercase"
                    placeholder="SBIN0001234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Beneficiary Name</label>
                  <input
                    type="text"
                    {...register('bank_account.beneficiary_name')}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-bold focus:border-primary/50 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 shrink-0">
        <ShieldCheck className="text-gray-600 shrink-0" size={16} />
        <p className="text-[9px] text-gray-500 leading-tight font-medium">
          By submitting this request, you authorize the transfer of funds to the provided account. Ensure details are accurate. Once processed, transfers cannot be reversed.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shrink-0 mt-auto"
      >
        {isSubmitting ? (
          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>REQUEST WITHDRAWAL</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
};

export default WithdrawForm;
