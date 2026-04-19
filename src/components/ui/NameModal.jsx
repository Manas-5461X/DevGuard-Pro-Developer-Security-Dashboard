import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';

export default function NameModal() {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hide entirely if no user or they already have a name initialized
  if (!currentUser || currentUser.displayName) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await updateProfile(currentUser, { displayName: name.trim() });
      // Force a reload to reflect the display name globally in Auth context
      window.location.reload();
    } catch (err) {
      console.error('Failed to set name', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000]/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="cyber-panel p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-[#F5F5F5]">Identify Yourself</h2>
        <p className="text-[#A3A3A3] text-sm mb-6">Please enter your name to personalize your dashboard profile.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyber-primary transition-colors"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-cyber-primary text-[#000] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-cyber-primary-hover transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>
    </div>
  );
}
