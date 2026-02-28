"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Menu, Grid3x3, GraduationCap, Users, Settings } from "lucide-react";
import { useGlobalStore } from "@/stores/useGlobalStore";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { sidebarOpen, toggleSidebar } = useGlobalStore();

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PEQ Grader" />
      </head>
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "w-64" : "w-0"
            } transition-all duration-300 bg-slate-800 text-white overflow-hidden`}
          >
            <div className="p-4">
              <nav className="space-y-2 mt-16">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <Grid3x3 size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/grids"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <GraduationCap size={20} />
                  <span>Grids</span>
                </Link>
                <Link
                  href="/students"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <Users size={20} />
                  <span>Students</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 active:scale-95 transition-all"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900 text-white shadow-md">
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Toggle sidebar"
                  >
                    <Menu size={24} />
                  </button>
                  <h1 className="text-xl font-bold">PEQ Grader</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Sync Status</span>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
