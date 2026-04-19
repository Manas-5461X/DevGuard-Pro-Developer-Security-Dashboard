import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

function getFirebaseSignupError(err) {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return { message: "An account with this email already exists.", action: 'login', actionText: 'Sign in instead' };
    case 'auth/invalid-email':
      return { message: "Please enter a valid email address.", action: null };
    case 'auth/weak-password':
      return { message: "Password is too weak. Use at least 6 characters with a mix of letters and numbers.", action: null };
    case 'auth/network-request-failed':
      return { message: "Network error. Please check your internet connection.", action: null };
    case 'auth/popup-closed-by-user':
      return { message: "Sign-in popup was closed. Please try again.", action: null };
    case 'auth/account-exists-with-different-credential':
      return { message: "An account already exists with this email using a different sign-in method. Try signing in with email/password.", action: null };
    default:
      return { message: "Could not create account. Please try again.", action: null };
  }
}

function PasswordInput({ value, onChange, placeholder = 'Enter password', id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-cyber-surface border border-cyber-border px-4 py-3 pr-11 text-cyber-text placeholder-cyber-dark-text focus:outline-none focus:border-cyber-primary rounded-xl transition-colors text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-dark-text hover:text-cyber-primary transition-colors"
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError({ message: 'Please enter a valid email address (e.g., name@domain.com)', action: null });
    }
    if (password.length < 6) {
      return setError({ message: 'Password must be at least 6 characters long.', action: null });
    }
    if (password !== passwordConfirm) {
      return setError({ message: 'Passwords do not match. Please re-enter your password.', action: null });
    }

    setLoading(true);
    try {
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(getFirebaseSignupError(err));
    }
    setLoading(false);
  }

  async function handleSocialSignup(provider) {
    setError(null);
    setLoading(true);
    try {
      if (provider === 'google') await loginWithGoogle();
      else if (provider === 'github') await loginWithGithub();
      navigate('/');
    } catch (err) {
      setError(getFirebaseSignupError(err));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-bg px-4 py-10 font-sans">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#4ADE80 1px, transparent 1px), linear-gradient(90deg, #4ADE80 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center mx-auto mb-5">
            <Shield size={26} className="text-cyber-primary" />
          </div>
          <h1 className="text-2xl font-bold text-cyber-text tracking-tight mb-1">Create your account</h1>
          <p className="text-cyber-dark-text text-sm">Join DevGuard Pro — it's free</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-cyber-error/10 border border-cyber-error/30 rounded-xl">
            <p className="text-cyber-error text-sm font-medium">{error.message}</p>
            {error.action === 'login' && (
              <Link to="/login" className="mt-2 flex items-center gap-1.5 text-cyber-primary text-xs font-semibold hover:underline">
                <ArrowRight size={13} /> {error.actionText}
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyber-dark-text text-xs font-semibold mb-1.5 uppercase tracking-widest">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-cyber-surface border border-cyber-border px-4 py-3 pl-10 text-cyber-text placeholder-cyber-dark-text focus:outline-none focus:border-cyber-primary rounded-xl transition-colors text-sm"
              />
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyber-dark-text" />
            </div>
          </div>
          <div>
            <label className="block text-cyber-dark-text text-xs font-semibold mb-1.5 uppercase tracking-widest">Password</label>
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} id="signup-password" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-cyber-dark-text text-xs font-semibold mb-1.5 uppercase tracking-widest">Confirm Password</label>
            <PasswordInput value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} id="signup-confirm" placeholder="Repeat your password" />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-cyber-primary text-black font-bold py-3 rounded-xl hover:bg-cyber-primary-hover transition-all mt-2 text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Creating Account...</> : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-cyber-border" />
          <span className="px-3 text-cyber-dark-text text-xs">or sign up with</span>
          <div className="flex-1 h-px bg-cyber-border" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleSocialSignup('google')} disabled={loading}
            className="flex items-center justify-center gap-2 border border-cyber-border hover:border-cyber-primary/40 text-cyber-dark-text hover:text-cyber-text py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button onClick={() => handleSocialSignup('github')} disabled={loading}
            className="flex items-center justify-center gap-2 border border-cyber-border hover:border-cyber-primary/40 text-cyber-dark-text hover:text-cyber-text py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        <p className="text-center text-cyber-dark-text mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyber-primary hover:text-cyber-primary-hover font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
