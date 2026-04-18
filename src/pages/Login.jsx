import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4">
      <div className="max-w-md w-full bg-[#252526] rounded-xl border border-[#3c3c3c] p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-8">Sign in to access DevGuard Pro</p>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
          Sign In
        </button>
      </div>
    </div>
  );
}
