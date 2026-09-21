import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
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
                <button type="button" onClick={() => toast.error('Google login pending configuration')} className="flex items-center justify-center py-2.5 px-4 border border-black dark:border-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300 gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-medium text-black dark:text-white">Google</span>
                </button>
                <button type="button" onClick={() => toast.error('GitHub login pending configuration')} className="flex items-center justify-center py-2.5 px-4 border border-black dark:border-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300 gap-2">
                  <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="text-sm font-medium text-black dark:text-white">GitHub</span>
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
