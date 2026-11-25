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
  console.log('UserHeader render:', { avatarUrl, coverUrl, name, showAvatarInTemplate });

return (
    <>
      {coverUrl && (
        <div className="relative w-full h-48 sm:h-60 md:h-72 overflow-hidden ${className}">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>
      )}
      {avatarUrl && (
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <img
            src={avatarUrl}
            alt={`${name || ''} avatar`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}
