'use client';

import React from 'react';

interface UserHeaderProps {
  avatarUrl?: string | null;
  coverUrl?: string | null;
  name?: string | null;
  showAvatarInTemplate?: boolean;
  className?: string;
}

export default function UserHeader({
  avatarUrl,
  coverUrl,
  name,
  showAvatarInTemplate = false,
  className = '',
}: UserHeaderProps) {
  return (
    <>
      {coverUrl && (
        <div className={`relative w-full overflow-hidden ${className}`}>
          <img src={coverUrl} alt="Cover" className="w-full h-48 sm:h-60 md:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>
      )}
      {avatarUrl && showAvatarInTemplate && (
        <img
          src={avatarUrl}
          alt={`${name || ''} avatar`}
          className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
        />
      )}
      {avatarUrl && !showAvatarInTemplate && (
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={`${name || ''} avatar`}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shrink-0"
          />
        </div>
      )}
    </>
  );
}
