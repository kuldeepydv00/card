import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/public/ForgotPassword';
import Signup from './pages/Signup';
import MyBets from './pages/MyBets';
import Transactions from './pages/Transactions';
import Withdraw from './pages/Withdraw';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResultsHistory from './pages/ResultsHistory';

// Public Pages
import Landing from './pages/public/Landing';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import FAQ from './pages/public/FAQ';
import About from './pages/public/About';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/arena" />;

  return (
    <SocketProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SocketProvider>
  );
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/faq" element={<FAQ />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/arena" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/my-bets" element={
        <PrivateRoute>
          <MyBets />
        </PrivateRoute>
      } />

      <Route path="/history" element={
        <PrivateRoute>
          <ResultsHistory />
        </PrivateRoute>
      } />

      <Route path="/transactions" element={
        <PrivateRoute>
          <Transactions />
        </PrivateRoute>
      } />

      <Route path="/wallet" element={
        <PrivateRoute>
          <Withdraw />
        </PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <AdminDashboard />
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
