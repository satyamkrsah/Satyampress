import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl dark:shadow-2xl border border-black dark:border-white dark:border-black dark:border-white overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-black dark:text-cream-dark mb-2">Welcome Back</h2>
              <p className="text-black dark:text-white dark:text-black dark:text-white text-sm">Please sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white dark:text-black dark:text-white mb-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-black dark:border-white dark:border-black dark:border-white rounded-lg bg-white dark:bg-black transition-colors duration-300 dark:bg-background-dark text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-black dark:text-white dark:text-black dark:text-white" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-gold hover:text-gold-light transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-black dark:border-white dark:border-black dark:border-white rounded-lg bg-white dark:bg-black transition-colors duration-300 dark:bg-background-dark text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-black/90 dark:bg-gold dark:text-black dark:text-cream-dark dark:hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black dark:border-white dark:border-black dark:border-white" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-surface-dark text-black dark:text-white">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center py-2.5 px-4 border border-black dark:border-white dark:border-black dark:border-white rounded-lg hover:bg-white dark:bg-black transition-colors duration-300 dark:hover:bg-white dark:bg-black transition-colors duration-300">
                  <span className="text-sm font-medium text-black dark:text-white dark:text-black dark:text-white">Google</span>
                </button>
                <button className="flex items-center justify-center py-2.5 px-4 border border-black dark:border-white dark:border-black dark:border-white rounded-lg hover:bg-white dark:bg-black transition-colors duration-300 dark:hover:bg-white dark:bg-black transition-colors duration-300">
                  <span className="text-sm font-medium text-black dark:text-white dark:text-black dark:text-white">GitHub</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-black transition-colors duration-300 dark:bg-background-dark px-8 py-4 border-t border-black dark:border-white dark:border-black dark:border-white text-center">
            <p className="text-sm text-black dark:text-white dark:text-black dark:text-white">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-gold hover:text-gold-light transition-colors">
                Sign up now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
