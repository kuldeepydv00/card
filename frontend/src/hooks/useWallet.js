import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const useWallet = () => {
  const { user, updateWallet } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    const { data } = await api.get('/balance');
    updateWallet(data.balance);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, fetchBalance, fetchTransactions };
};

export default useWallet;
