'use client';

import React, { useState } from 'react';

interface ProfilePhotoUploaderProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  allowPhoto?: boolean;
}

export default function ProfilePhotoUploader({ avatarUrl, setAvatarUrl, allowPhoto }: ProfilePhotoUploaderProps) {
  const [photoUrlInput, setPhotoUrlInput] = useState(avatarUrl);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoUrlInput(e.target.value);
  };

  const handlePhotoConfirm = () => {
    if (photoUrlInput) {
      setAvatarUrl(photoUrlInput);
    }
  };

  if (!allowPhoto) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-slate-800/50 space-y-2 print:hidden">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Include Profile Photo (Creative roles only)</label>
      <div className="space-y-2">
        {avatarUrl && (
          <div className="relative inline-block">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-slate-700/50 shadow-md"
            />
            <button
              onClick={() => setAvatarUrl('')}
              className="absolute top-0 right-0 bg-slate-900 text-white text-[9px] rounded-full p-1 hover:bg-slate-700 transition-colors"
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        )}
        <input
          type="text"
          value={photoUrlInput}
          onChange={handlePhotoChange}
          placeholder="Paste image URL..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button onClick={handlePhotoConfirm} disabled={uploading} className={`w-full py-1.5 text-xs font-medium rounded-lg transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
          {uploading ? 'Applying...' : 'Set Photo'}
        </button>
      </div>
    </div>
  );
}