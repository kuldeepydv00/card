import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, updateWallet } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const s = initSocket(user.id);
      setSocket(s);

      // Balance updated — instantly reflect new balance
      s.on('balance_updated', (data) => {
        updateWallet(data.balance);

        // If it's a win, show a celebration toast
        if (data.won) {
          toast.success(
            `🎉 YOU WON! ₹${data.winAmount?.toLocaleString()} added to your wallet! (Card: ${data.card})`,
            { duration: 8000, position: 'top-center' }
          );
        } else {
          toast.success(`💰 Wallet updated: ₹${data.balance?.toLocaleString()}`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      });

      // Result declared — refresh wallet from server in case we won
      // (handles edge case where balance_updated is missed)
      s.on('result_declared', async (data) => {
        toast(`🃏 Result: ${data.winningCard} wins this round!`, {
          duration: 5000,
          position: 'top-right',
          icon: '🎴',
        });

        // Refresh wallet balance from server
        try {
          const { data: walletData } = await api.get('/balance');
          updateWallet(walletData.balance);
        } catch (err) {
          // silent fail — balance_updated event handles winners
        }
      });

      return () => s.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
