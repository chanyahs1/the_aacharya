import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo />
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">
            Welcome to Employee Management System
          </h2>
          <p className="mt-2 text-neutral-600">
            Please select your login type to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/hr-login')}
            className="w-full bg-primary-600 text-white rounded-lg px-4 py-3 flex items-center justify-center hover:bg-primary-700 transition-colors"
          >
            <span className="text-lg font-medium">HR Login</span>
          </button>

          <button
            onClick={() => navigate('/employee-login')}
            className="w-full bg-white border-2 border-primary-600 text-primary-600 rounded-lg px-4 py-3 flex items-center justify-center hover:bg-primary-50 transition-colors"
          >
            <span className="text-lg font-medium">Employee Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}