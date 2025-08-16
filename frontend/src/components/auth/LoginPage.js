import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { themes } from '../../constants/themes';

const LoginPage = ({ theme, onClose, onLoginSuccess }) => {
  const currentColors = themes[theme];
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={`relative backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-lg w-full border border-[${currentColors.glassBorder}] max-h-[90vh] overflow-y-auto`}
    >
      <button onClick={onClose} className={`absolute top-4 right-4 text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors duration-300`} aria-label="Close login form">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <h2 className={`text-4xl font-bold mb-2 text-[${currentColors.primaryText}] text-center`}>
        {isLoginMode ? 'Welcome back' : 'Create Account'}
      </h2>
      <p className={`text-center mb-10 text-[${currentColors.primaryText}] opacity-80`}>
        {isLoginMode ? 'Login to your account' : 'Join ECHO today!'}
      </p>

      <div className={`flex justify-center mb-8 rounded-full bg-[${currentColors.secondaryBg}] p-1`}>
        <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${isLoginMode ? `bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] shadow-md` : `text-[${currentColors.primaryText}] hover:bg-[${currentColors.darkGold}] hover:bg-opacity-30`}`}>Login</button>
        <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${!isLoginMode ? `bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] shadow-md` : `text-[${currentColors.primaryText}] hover:bg-[${currentColors.darkGold}] hover:bg-opacity-30`}`}>Create Account</button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Email</label>
          <input type="email" id="email" placeholder="your@example.com" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
        </div>
        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} id="password" placeholder="••••••••" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
            <button type="button" onClick={togglePasswordVisibility} className={`absolute right-3 top-1/2 -translate-y-1/2 text-[${currentColors.primaryText}] opacity-70 hover:opacity-100`}>
              {showPassword ? <EyeOff className={`h-5 w-5 text-[${currentColors.primaryText}]`} /> : <Eye className={`h-5 w-5 text-[${currentColors.primaryText}]`} />}
            </button>
          </div>
        </div>
        {!isLoginMode && (
          <div>
            <label htmlFor="confirm-password" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirm-password" placeholder="••••••••" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
              <button type="button" onClick={toggleConfirmPasswordVisibility} className={`absolute right-3 top-1/2 -translate-y-1/2 text-[${currentColors.primaryText}] opacity-70 hover:opacity-100`}>
                {showConfirmPassword ? <EyeOff className={`h-5 w-5 text-[${currentColors.primaryText}]`} /> : <Eye className={`h-5 w-5 text-[${currentColors.primaryText}]`} />}
              </button>
            </div>
          </div>
        )}
        <button type="submit" className={`w-full p-3 mt-8 rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors duration-300 transform hover:scale-105`}>
          {isLoginMode ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <div className={`flex items-center justify-center my-8 text-[${currentColors.primaryText}] opacity-70`}>
        <span className="h-px w-1/4 bg-current"></span><span className="mx-4">or</span><span className="h-px w-1/4 bg-current"></span>
      </div>

      <div className="space-y-4">
        <button className={`w-full p-3 rounded-lg flex items-center justify-center border border-[${currentColors.darkGold}] bg-[${currentColors.primaryBg}] hover:bg-[${currentColors.secondaryBg}] text-[${currentColors.primaryText}] font-semibold transition-colors duration-300`}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.421,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          {isLoginMode ? 'Login with Google' : 'Sign Up with Google'}
        </button>
        <button className={`w-full p-3 rounded-lg flex items-center justify-center border border-[${currentColors.darkGold}] bg-[${currentColors.primaryBg}] hover:bg-[${currentColors.secondaryBg}] text-[${currentColors.primaryText}] font-semibold transition-colors duration-300`}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22,12c0-5.523-4.477-10-10-10S2,6.477,2,12c0,4.991,3.657,9.128,8.438,9.878V14.877h-2.54V12h2.54V9.797c0-2.506,1.492-3.89,3.777-3.89c1.094,0,2.238,0.195,2.238,0.195v2.46h-1.26c-1.24,0-1.628,0.772-1.628,1.562V12h2.773l-0.443,2.877h-2.33V21.878C18.343,21.128,22,16.991,22,12z" />
          </svg>
          {isLoginMode ? 'Login with Facebook' : 'Sign Up with Facebook'}
        </button>
      </div>
    </motion.div>
  );
};

export default LoginPage;
