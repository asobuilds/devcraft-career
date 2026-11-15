import React from "react";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";

export const metadata = {
  title: "DevCraft Career",
  description: "Next-Generation Full-Stack Career Optimization Engine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Sidebar />
        <main className="pl-16 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}