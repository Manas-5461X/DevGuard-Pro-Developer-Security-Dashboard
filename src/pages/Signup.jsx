import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 py-8">
      <div className="max-w-md w-full bg-[#252526] rounded-xl border border-[#3c3c3c] p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Shield className="text-green-500" size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-400 mb-8">Join DevGuard Pro today</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-green-500 hover:text-green-400">Log in</Link>
        </p>
      </div>
    </div>
  );
}

