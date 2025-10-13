"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
  { 
    href: "/admin/settings", 
    label: "Settings", 
    icon: "⚙️",
    children: [
      { href: "/admin/customers", label: "Customers", icon: "👥" },
      { href: "/admin/admins", label: "Admins", icon: "👨‍💼" },
      { href: "/admin/analytics", label: "Analytics", icon: "📈" },
      { href: "/admin/banners", label: "Banners", icon: "🎨" },
    ]
  },
];

export default function ResponsiveAdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(savedCollapsedState));
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Auto-expand Settings menu if on a child page
  useEffect(() => {
    const settingsLink = links.find(link => link.label === "Settings");
    if (settingsLink?.children) {
      const isOnChildPage = settingsLink.children.some(child => pathname === child.href);
      if (isOnChildPage && !isCollapsed) {
        setExpandedMenu(settingsLink.href);
      }
    }
  }, [pathname, isCollapsed]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "w-64 lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={clsx(
            "border-b border-gray-200 dark:border-gray-700",
            isCollapsed ? "p-3" : "p-6"
          )}>
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      TaYaima
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Admin Panel
                    </p>
                  </div>
                </div>
              )}
              
              {isCollapsed && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Collapse Toggle Button - Desktop only */}
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <svg
                    className={clsx(
                      "w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300",
                      isCollapsed && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                
                {/* Close button for mobile */}
                <button
                  onClick={closeMobileMenu}
                  className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close menu"
                >
                  <span className="block w-6 h-6 text-gray-500 dark:text-gray-400">✕</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className={clsx(
            "flex-1 overflow-y-auto",
            isCollapsed ? "px-2 py-4" : "px-4 py-4"
          )}>
            <div className="space-y-1">
              {links.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const isExpanded = expandedMenu === link.href;
                const isActive = pathname === link.href || (hasChildren && link.children?.some(child => pathname === child.href));

                return (
                  <div key={link.href}>
                    {hasChildren ? (
                      <button
                        onClick={() => {
                          if (isCollapsed) {
                            // If collapsed, expand the sidebar first
                            setIsCollapsed(false);
                            setExpandedMenu(link.href);
                          } else {
                            // If expanded, toggle the submenu
                            setExpandedMenu(isExpanded ? null : link.href);
                          }
                        }}
                        className={clsx(
                          "flex items-center rounded-lg text-sm font-medium transition-colors w-full group relative",
                          isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3",
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                        title={isCollapsed ? link.label : undefined}
                      >
                        <span className="text-lg flex-shrink-0">{link.icon}</span>
                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{link.label}</span>
                            <svg
                              className={clsx(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {link.label} (Click to expand)
                          </div>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={link.href as any}
                        onClick={closeMobileMenu}
                        className={clsx(
                          "flex items-center rounded-lg text-sm font-medium transition-colors w-full group relative",
                          isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3",
                          pathname === link.href
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                        title={isCollapsed ? link.label : undefined}
                      >
                        <span className="text-lg flex-shrink-0">{link.icon}</span>
                        {!isCollapsed && <span className="truncate">{link.label}</span>}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {link.label}
                          </div>
                        )}
                      </Link>
                    )}

                    {/* Sub-menu items */}
                    {hasChildren && isExpanded && !isCollapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {link.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href as any}
                            onClick={closeMobileMenu}
                            className={clsx(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              pathname === child.href
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                            )}
                          >
                            <span className="text-base">{child.icon}</span>
                            <span className="truncate">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className={clsx(
            "border-t border-gray-200 dark:border-gray-700",
            isCollapsed ? "p-2" : "p-2"
          )}>
            {!isCollapsed && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Tayaima Store Admin
              </div>
            )}
            {isCollapsed && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                TSA
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
