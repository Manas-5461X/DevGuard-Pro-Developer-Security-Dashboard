import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Github } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
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

  async function handleSocialSignup(provider) {
    try {
      setError('');
      setLoading(true);
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'github') {
        await loginWithGithub();
      }
      navigate('/');
    } catch (err) {
      setError(`Failed to sign up with ${provider}.`);
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

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-[#3c3c3c]"></div>
          <span className="px-4 text-gray-500 text-sm">or sign up with</span>
          <div className="flex-grow border-t border-[#3c3c3c]"></div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSocialSignup('google')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialSignup('github')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#252526] hover:bg-[#2d2d2d] border border-[#3c3c3c] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Github size={20} />
            GitHub
          </button>
        </div>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-green-500 hover:text-green-400">Log in</Link>
        </p>
      </div>
    </div>
  );
}

