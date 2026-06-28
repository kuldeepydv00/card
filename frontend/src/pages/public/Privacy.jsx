import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PublicFooter from '../../components/layout/PublicFooter';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans">
      <Helmet>
        <title>Privacy Policy | 50xcards - Online Card Game India</title>
        <meta name="description" content="Read the Privacy Policy for 50xcards. We take your security and data protection seriously while you play real money card games." />
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
        <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy - 50xcards</h1>
        <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
          <p>Last updated: June 2026</p>
          
          <h2>1. Data Collection</h2>
          <p>At 50xcards, we only collect the information absolutely necessary to provide you with a secure and seamless gaming experience. This includes your email address, phone number (for verification), and minimal financial details required to process your withdrawals.</p>
          
          <h2>2. Use of Information</h2>
          <p>Your data is strictly used to maintain your account, secure your funds, and prevent fraud. We do not sell your personal data to third-party marketing companies under any circumstances.</p>

          <h2>3. Security Protocols</h2>
          <p>All sensitive data is encrypted at rest and in transit using industry-standard AES-256 encryption. Our databases are secured behind private subnets and reverse proxies to prevent unauthorized access.</p>

          <h2>4. Cookies and Tracking</h2>
          <p>50xcards uses functional cookies strictly to maintain your session state securely. We do not use aggressive cross-site tracking or invasive analytics.</p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Privacy;
