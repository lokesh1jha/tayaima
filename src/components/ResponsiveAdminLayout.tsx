"use client";

import { ReactNode } from "react";
import ResponsiveAdminSidebar from "./ResponsiveAdminSidebar";

interface ResponsiveAdminLayoutProps {
  children: ReactNode;
}

export default function ResponsiveAdminLayout({ children }: ResponsiveAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <ResponsiveAdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar for Mobile */}
          <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="ml-16"> {/* Space for hamburger menu */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h2>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
