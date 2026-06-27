import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PublicFooter from '../../components/layout/PublicFooter';

const FAQ = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans">
      <Helmet>
        <title>Help Center & FAQ | 50xcards</title>
        <meta name="description" content="Get help with your 50xcards account, deposits, withdrawals, and understand how the card trading multipliers work." />
      </Helmet>

      {/* Navbar Minimal */}
      <nav className="border-b border-white/5 bg-[#0a0f1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-black text-2xl tracking-tight">
              50x<span className="text-primary">cards</span>
            </span>
          </Link>
          <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
            Back to Arena
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-black mb-8">Help Center & FAQ</h1>
        <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
          
          <h2>How does the game work?</h2>
          <p>Every hour, a new betting cycle opens. Players place wagers on specific cards. At exactly the top of the hour (e.g., 5:00 PM), the system calculates the total amount of money wagered on each card across the entire platform. The card with the lowest total volume is declared the winner.</p>
          
          <h2>How much do I win?</h2>
          <p>If you placed a bet on the winning card, you will instantly receive a 50x multiplier on your original wager. For example, a ₹100 bet on the winning card yields a ₹5,000 payout.</p>

          <h2>Are my funds safe?</h2>
          <p>Yes. 50xcards utilizes encrypted wallets for every user. All deposits are manually verified or processed through secure crypto gateways. Withdrawals are subjected to strict risk-management checks to ensure funds are safely transferred to their rightful owners.</p>

          <h2>Can I cancel a bet?</h2>
          <p>No. Once a wager is confirmed and submitted to the live blockchain/database, it is immutable and cannot be cancelled. Please double-check your predictions before confirming.</p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default FAQ;
