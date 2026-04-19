import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-cyber-surface border border-cyber-border rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-cyber-error/10 text-cyber-error' : 'bg-cyber-primary/10 text-cyber-primary'}`}>
              <AlertCircle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="text-cyber-dark-text hover:text-cyber-text transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-cyber-text mb-2">{title}</h3>
          <p className="text-cyber-dark-text text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-cyber-border text-cyber-dark-text hover:text-cyber-text hover:border-cyber-primary/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${
                type === 'danger' 
                ? 'bg-cyber-error text-white hover:bg-red-600' 
                : 'bg-cyber-primary text-black hover:bg-cyber-primary-hover shadow-cyber-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
