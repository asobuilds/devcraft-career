import React from "react";
import "./globals.css";
import SidebarClient from "@/app/components/SidebarClient";

export const metadata = {
  title: "DevCraft Career",
  description: "Next-Generation Full-Stack Career Optimization Engine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <SidebarClient />
        <main className="pl-20 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}