import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, ArrowRight } from 'lucide-react';

export default function NameModal() {
  const { currentUser, updateUserDisplayName } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Show modal if:
  // 1. We have a logged-in user
  // 2. They don't have a displayName set yet (never been asked)
  if (!currentUser || currentUser.displayName) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await updateUserDisplayName(name.trim());
      // State update in AuthContext will cause re-render and modal will hide naturally
    } catch (err) {
      console.error('Failed to set name', err);
      setError('Could not save your name. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-cyber-bg border border-cyber-border rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center mx-auto mb-6">
          <User size={24} className="text-cyber-primary" />
        </div>

        <h2 className="text-xl font-bold text-cyber-text text-center mb-2 tracking-tight">
          What should we call you?
        </h2>
        <p className="text-cyber-dark-text text-sm text-center mb-8 leading-relaxed">
          This name will appear on your dashboard and personalize your security reports.
        </p>

        {error && (
          <p className="text-cyber-error text-xs text-center mb-4 bg-cyber-error/10 border border-cyber-error/20 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="e.g. Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-cyber-surface border border-cyber-border text-cyber-text placeholder-cyber-dark-text px-4 py-3 rounded-xl focus:outline-none focus:border-cyber-primary transition-colors text-sm"
            required
            autoFocus
            maxLength={50}
          />
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || name.trim().length < 2}
            className="w-full flex items-center justify-center gap-2 bg-cyber-primary text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-cyber-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
