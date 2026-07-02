import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, History, Wallet } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#12141D] border-t border-white/5 flex items-center justify-around px-2 z-[100] pb-1">
      <NavItem to="/home" icon={<Home size={22} />} label="Home" />
      <NavItem to="/arena" icon={<Trophy size={22} />} label="Arena" />
      <NavItem to="/history" icon={<History size={22} />} label="Matches" />
      <NavItem to="/wallet" icon={<Wallet size={22} />} label="Wallet" />
    </div>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === '/home'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
          isActive ? 'text-[#FFD700]' : 'text-gray-500 hover:text-gray-300'
        }`
      }
    >
      {React.cloneElement(icon, { strokeWidth: 2.5 })}
      <span className="text-[9px] font-bold tracking-wide">{label}</span>
    </NavLink>
  );
};

export default BottomNav;
