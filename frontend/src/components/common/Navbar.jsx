import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, History, Wallet, UserCircle, LogOut, Settings, Bell, Trophy, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { label: 'Game', path: '/arena', icon: LayoutDashboard },
    { label: 'History', path: '/my-bets', icon: History },
    { label: 'Last Result', path: '/results', icon: Trophy },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
  ];

  if (user.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <nav className="glass-card border-none border-b border-white/5 sticky top-0 z-50 rounded-none h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-10">
            <Link to="/arena" className="flex items-center gap-3 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                50x
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                50x<span className="text-primary">cards</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-4 py-2 group"
                  >
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-500'} />
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 bg-white/5 border border-white/5 p-1.5 pl-4 rounded-2xl">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balance</span>
                <span className="text-sm font-black text-accent">₹{user.wallet_balance.toLocaleString()}</span>
              </div>
              <Link to="/wallet" className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors group">
                <Wallet size={16} className="text-gray-400 group-hover:text-white" />
              </Link>
            </div>
            
            <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block"></div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-white">{user.username}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 group transition-all"
                >
                  <LogOut size={18} className="text-gray-500 group-hover:text-red-500" />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-[#0b0e14]/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex sm:hidden items-center justify-between bg-white/5 border border-white/5 p-3 rounded-2xl mb-4">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balance</span>
                  <span className="text-sm font-black text-accent">₹{user.wallet_balance.toLocaleString()}</span>
                </div>
                <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-gray-400">
                  <Wallet size={16} />
                </Link>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="mt-4 pt-4 border-t border-white/10 md:hidden flex justify-between items-center px-4">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-white">{user.username}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold"
                >
                  <LogOut size={16} /> LOGOUT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
