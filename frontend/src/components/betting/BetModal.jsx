import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const schema = z.object({
  amount: z.number().min(10, "Minimum bet is ₹10").max(1000000, "Maximum bet is ₹1,000,000")
});

const BetModal = ({ cardCode, onClose, onSubmit, balance }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: 10 }
  });

  const amount = watch('amount') || 0;
  const potentialWin = amount * 50;

  return (
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
        className="glass-card w-full max-w-lg p-10 rounded-[3rem] relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />

        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-black flex items-center gap-3">
              PLACE <span className="text-primary">BET</span>
            </h3>
            <p className="text-gray-500 text-sm mt-1">Confirming wagers for champion card</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data.amount))}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div className="bg-background/50 p-6 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Selected Card</span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-2xl font-black text-primary">
                    {cardCode}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    Settles at end of current hour slot.
                  </div>
                </div>
              </div>

              <div className="bg-background/50 p-6 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Potential Payout</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-accent">₹{potentialWin.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-gray-600">(@ 50x)</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Wager Amount</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-500 text-lg">₹</span>
                  <input
                    type="number"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full glass-input rounded-2xl p-4 pl-10 text-2xl font-black"
                    autoFocus
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.amount.message}</p>}
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500">AVAILABLE</span>
                  <span className="text-sm font-black text-white">₹{balance.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-gray-500">REMAINING</span>
                  <span className="text-sm font-black text-gray-400">₹{(balance - amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-10">
            <Info size={16} className="text-primary shrink-0" />
            <p className="text-[10px] text-primary/80 font-medium leading-relaxed">
              Once placed, bets are final and cannot be cancelled. The winner is determined by the lowest total bet volume at the start of the next hour.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || amount > balance}
            className={`w-full py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-3 shadow-xl ${
              amount > balance 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/20 hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <TrendingUp size={20} />
                <span>{amount > balance ? 'INSUFFICIENT FUNDS' : 'CONFIRM WAGER'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BetModal;
