import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, ShieldCheck, ChevronDown, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import PublicFooter from '../../components/layout/PublicFooter';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "What is 50xcards?",
      a: "50xcards is the premier online card prediction and trading arena. It allows players to place wagers on specific cards every hour, with winners determined by the lowest total bet volume. It's the most thrilling multiplayer card betting experience online."
    },
    {
      q: "Is betting on 50xcards safe?",
      a: "Yes. 50xcards uses state-of-the-art encryption and a verifiably fair algorithm to determine winning cards based purely on real-time multiplayer pool volumes. Your funds and data are protected with bank-grade security."
    },
    {
      q: "How does the 50x multiplier work?",
      a: "At the end of every hour slot, the card with the lowest total wager volume is declared the winner. Anyone who placed a bet on that specific champion card receives a massive 50x payout on their original wager."
    },
    {
      q: "How can I deposit and withdraw?",
      a: "We support instant deposits and rapid withdrawals via UPI, bank transfer, and major crypto networks. Approvals for payouts are handled quickly by our 24/7 financial team."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans selection:bg-primary/30">
      <Helmet>
        <title>50xcards | The Best Card Trading & Betting Game in India</title>
        <meta name="description" content="Play 50xcards, the most thrilling online multiplayer card prediction game. Place your bets, track live volumes, and win massive 50x payouts in real-time." />
        <meta name="keywords" content="50xcards, card trading, online betting, best betting game in India, crypto casino, multiplayer card game, real money betting" />
        <link rel="canonical" href="https://50xcards.in/" />
      </Helmet>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0a0f1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-primary/20">
              50x
            </div>
            <span className="font-black text-2xl tracking-tight hidden sm:block">
              50x<span className="text-primary">cards</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary mb-6 inline-block">
              The #1 Online Betting Arena
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              Predict. Wager. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Win 50x Instantly.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
              Join the ultimate card trading and multiplayer prediction game in India. Place wagers on your lucky cards and secure massive payouts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto bg-primary text-white text-lg font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105 hover:bg-primary-hover flex items-center justify-center gap-3">
                <Play size={20} fill="currentColor" /> Play Now
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white text-lg font-bold px-10 py-5 rounded-2xl transition-all hover:bg-white/10 flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Live Card Trading</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Experience the thrill of real-time multiplayer volumes. Monitor the active pools and strategically place your wagers right before the hour closes.
              </p>
            </div>
            <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Massive 50x Payouts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The lowest volume card takes the crown. If you backed the winning champion card, your wager is instantly multiplied by 50x and credited to your wallet.
              </p>
            </div>
            <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Secure & Fair</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Built on a provably fair algorithm with immediate UPI and Crypto payouts. The best betting game in India ensures your funds are always safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Still Have Questions?</h2>
          <p className="text-gray-400">Everything you need to know about the 50xcards arena.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-lg">{faq.q}</span>
                <ChevronDown className={`transform transition-transform ${openFaq === idx ? 'rotate-180 text-primary' : 'text-gray-500'}`} size={20} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;
