import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PublicFooter from '../../components/layout/PublicFooter';

const About = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans">
      <Helmet>
        <title>About Us | 50xcards - Online Card Game India</title>
        <meta name="description" content="Learn more about 50xcards, the best real money multiplayer online card game in India. Discover our mission to provide the ultimate card trading platform." />
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
        <h1 className="text-4xl md:text-5xl font-black mb-8">About 50xcards - Online Card Game India</h1>
        <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
          <p>Founded in 2026, 50xcards was built to revolutionize the online prediction and card trading space. We noticed a lack of genuinely fair, multiplayer-driven platforms in the market, so we built our own.</p>
          
          <h2>Our Mission</h2>
          <p>Our mission is to provide the most transparent, thrilling, and rewarding online betting experience in India and globally. By removing the "house edge" completely and relying purely on player-vs-player volume dynamics, we ensure a mathematically fair playing field where strategy actually matters.</p>

          <h2>Why "50x"?</h2>
          <p>We believe in high stakes and massive rewards. Instead of fractional payouts, our unique hourly pool system aggregates all global wagers and rewards the sharpest players with an immense 50x multiplier on their successful predictions.</p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default About;
