import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <footer className="bg-[#0f172a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/20">
                50x
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                50x<span className="text-primary">cards</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              The premier online destination for real-time card prediction and multiplier betting. Play smart, win big.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Casino Games</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Card Arena</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Multiplayer Pools</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Live Betting</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center & FAQ</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Fairness Protocol</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Responsible Gambling</Link></li>
              <li><a href="mailto:support@50xcards.in" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">About Us</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">Our Story</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">AML Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Payment Info</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Deposits & Withdrawals</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Supported Currencies</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">UPI Transfers</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Payout Limits</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs leading-relaxed max-w-3xl">
            © {new Date().getFullYear()} 50xcards.in | All Rights Reserved. <br/>
            50xcards is an online card trading and prediction platform. 50xcards is committed to responsible gaming. 
            Players must be 18+ to participate. Please play responsibly.
          </p>
          <div className="flex gap-4">
            <span className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs hover:bg-white/10 transition-colors">18+</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
