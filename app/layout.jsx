import React from "react";
import "./globals.css";
import AppShell from "@/app/components/AppShell";

export const metadata = {
  title: "DevCraft Career",
  description: "Next-Generation Full-Stack Career Optimization Engine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
