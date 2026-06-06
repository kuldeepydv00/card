import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBets from './pages/MyBets';
import Transactions from './pages/Transactions';
import Withdraw from './pages/Withdraw';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResultsHistory from './pages/ResultsHistory';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <SocketProvider>
            <Dashboard />
          </SocketProvider>
        </PrivateRoute>
      } />

      <Route path="/my-bets" element={
        <PrivateRoute>
          <SocketProvider>
            <MyBets />
          </SocketProvider>
        </PrivateRoute>
      } />

      <Route path="/transactions" element={
        <PrivateRoute>
          <SocketProvider>
            <Transactions />
          </SocketProvider>
        </PrivateRoute>
      } />

      <Route path="/results" element={
        <PrivateRoute>
          <SocketProvider>
            <ResultsHistory />
          </SocketProvider>
        </PrivateRoute>
      } />

      <Route path="/wallet" element={
        <PrivateRoute>
          <SocketProvider>
            <Withdraw />
          </SocketProvider>
        </PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <SocketProvider>
            <AdminDashboard />
          </SocketProvider>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-center" />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
