import dynamic from 'next/dynamic';
import React from "react";
import "./globals.css";
const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });

export const metadata = {
  title: "DevCraft Career",
  description: "Next-Generation Full-Stack Career Optimization Engine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Sidebar />
        <main className="pl-20 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}