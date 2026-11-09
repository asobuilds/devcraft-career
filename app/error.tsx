'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/60 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
        <div className="h-12 w-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          An unexpected error occurred while rendering this page. Please try again.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-600 break-all">{error.digest}</p>
        )}
        <button
          onClick={reset}
          className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="block text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
