import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, ShieldCheck, KeyRound, Sparkles, Phone, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const { signup, verifySignup } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom OTP state
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [isVerifying, setIsVerifying] = useState(false);

  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors, isSubmitting: isSignupSubmitting } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSignupSubmit = async (data) => {
    try {
      await signup(data.username, data.email, data.password, data.phone);
      setSignupData(data);
      setStep(2);
      toast.success('OTP sent to your email!', {
        icon: '✉️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next
    if (value !== '' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
    
    // Auto-submit if all filled
    if (value !== '' && index === 5 && newOtpValues.every(v => v !== '')) {
      submitOtp(newOtpValues.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const submitOtp = async (otpString) => {
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    
    setIsVerifying(true);
    try {
      await verifySignup(signupData.username, signupData.email, signupData.password, signupData.phone, otpString);
      toast.success('Registration successful!', {
        icon: '🎉',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
      // Clear OTP on failure
      setOtpValues(['', '', '', '', '', '']);
      otpRefs[0].current.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const onOtpSubmitBtn = (e) => {
    e.preventDefault();
    submitOtp(otpValues.join(''));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/15 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-secondary/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(99,102,241,0.1)] border border-white/10">
          
          {/* Left Side - Info */}
          <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-surface/80 to-background/90 p-10 flex-col justify-between border-r border-white/5 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30"
              >
                <Sparkles className="text-white" size={28} />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold mb-4 premium-gradient-text"
              >
                Join the 50xcards Arena
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-base leading-relaxed"
              >
                Step into a world of skill and luck. Create your premium account today and start betting on the most exciting card games.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-5 relative z-10"
            >
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Instant Payouts</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Zero waiting time on wins</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">50x Winning Potential</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Maximize your returns</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-8 md:p-14 relative bg-surface/40 backdrop-blur-md flex items-center justify-center min-h-[600px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md"
                >
                  <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-white tracking-tight">Create Account</h1>
                    <p className="text-gray-400 text-sm">Fill in your details to get started</p>
                  </div>

                  <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <input
                          type="text"
                          {...registerSignup('username')}
                          className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-4 pl-12 text-sm text-white outline-none transition-all duration-300 shadow-inner"
                          placeholder="Enter your username"
                        />
                      </div>
                      {signupErrors.username && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{signupErrors.username.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <input
                          type="email"
                          {...registerSignup('email')}
                          className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-4 pl-12 text-sm text-white outline-none transition-all duration-300 shadow-inner"
                          placeholder="Enter your mail"
                        />
                      </div>
                      {signupErrors.email && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{signupErrors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <input
                          type="tel"
                          {...registerSignup('phone')}
                          className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-4 pl-12 text-sm text-white outline-none transition-all duration-300 shadow-inner"
                          placeholder="Enter your phone no."
                        />
                      </div>
                      {signupErrors.phone && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{signupErrors.phone.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          {...registerSignup('password')}
                          className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-4 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 shadow-inner"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {signupErrors.password && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{signupErrors.password.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Re-enter Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerSignup('confirmPassword')}
                          className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:bg-black/40 rounded-xl p-4 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 shadow-inner"
                          placeholder="Enter your password again"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {signupErrors.confirmPassword && <p className="text-red-400 text-[11px] mt-1.5 ml-1 font-medium">{signupErrors.confirmPassword.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSignupSubmitting}
                      className="w-full btn-primary mt-8 py-4 flex items-center justify-center gap-2 group text-base"
                    >
                      {isSignupSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-400 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-white hover:text-primary font-bold transition-colors ml-1">Sign In</Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md flex flex-col items-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                  >
                    <KeyRound className="text-primary" size={28} />
                  </motion.div>
                  
                  <h1 className="text-3xl font-extrabold mb-3 text-white">Verify Email</h1>
                  <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                    We've sent a 6-digit verification code to<br/>
                    <strong className="text-white bg-white/5 px-2 py-1 rounded-md ml-1">{signupData?.email}</strong>
                  </p>

                  <form onSubmit={onOtpSubmitBtn} className="w-full">
                    <div className="flex justify-between gap-2 md:gap-3 mb-8">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 md:w-14 md:h-16 bg-black/30 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:border-primary focus:bg-black/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || otpValues.some(v => v === '')}
                      className="w-full btn-primary py-4 flex items-center justify-center gap-2 group text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Create Account</span>
                          <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-6 text-sm text-gray-400 hover:text-white transition-colors font-medium flex items-center justify-center gap-2 w-full"
                    >
                      <ArrowRight size={14} className="rotate-180" />
                      Back to details
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
