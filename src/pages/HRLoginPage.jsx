import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Logo from '../components/ui/Logo';

export default function HRLoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const res = await fetch('https://the-aacharya.onrender.com/api/hr/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('currentHR', JSON.stringify(data));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('currentHR', JSON.stringify(data));
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
 
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-card p-8">
          <div className="text-center mb-8">
            <Logo />
            <h2 className="mt-6 text-2xl font-bold text-neutral-900">Welcome Back!</h2>
            <p className="mt-2 text-neutral-600">Sign in to your HR account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-md"
            >
              {error}
            </motion.div>
          )}

          {isLoading ? (
            <div className="text-center py-6">
              <svg
                className="animate-spin h-8 w-8 text-primary-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <p className="text-neutral-600 mt-4">Logging you in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-primary-700 transition-colors ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                Sign In
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Need help? Contact{' '}
          <a href="mailto:admin@theaacharya.com" className="font-medium text-primary-600 hover:text-primary-500">
            Admin
          </a>
        </p>
      </motion.div>
    </div>
  );
}
