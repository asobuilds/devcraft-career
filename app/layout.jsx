import React from "react";
import "./globals.css";
import AppShell from "@/app/components/AppShell";

export const metadata = {
  title: "DevCraft Career",
  description: "Next-Generation Full-Stack Career Optimization Engine",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-x-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
