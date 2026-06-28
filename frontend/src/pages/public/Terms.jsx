import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PublicFooter from '../../components/layout/PublicFooter';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans">
      <Helmet>
        <title>Terms of Service | 50xcards - Online Card Game India</title>
        <meta name="description" content="Read the Terms of Service for 50xcards, India's premier real money card trading and online betting platform." />
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
        <h1 className="text-4xl md:text-5xl font-black mb-8">Terms of Service - 50xcards</h1>
        <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
          <p>Last updated: June 2026</p>
          
          <h2>1. Introduction</h2>
          <p>Welcome to 50xcards. By accessing and using our website, you agree to be bound by these Terms of Service. 50xcards is a skill-based card prediction and trading platform designed for entertainment purposes.</p>
          
          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years of age (or the age of majority in your jurisdiction) to participate in any real-money prediction pools on 50xcards. By registering an account, you represent and warrant that you meet this age requirement.</p>

          <h2>3. Account Security</h2>
          <p>You are strictly responsible for maintaining the confidentiality of your account credentials. 50xcards will never ask for your password. Any unauthorized use of your account is at your own risk.</p>

          <h2>4. 50x Multiplier and Wagers</h2>
          <p>All wagers placed on 50xcards are final and cannot be cancelled or reversed. The winning card is determined algorithmically by calculating the lowest total bet volume across the global player pool at the precise start of the next hour slot. Winners receive a 50x payout on their principal wager.</p>

          <h2>5. Deposits and Withdrawals</h2>
          <p>Withdrawals are subject to manual review to prevent fraud and comply with AML (Anti-Money Laundering) regulations. 50xcards reserves the right to request additional KYC (Know Your Customer) information before processing payouts.</p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Terms;
