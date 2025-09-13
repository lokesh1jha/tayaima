"use client";

import Link from "next/link";
import Button from "./ui/Button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => setMounted(true), []);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          MySaaS
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
          {mounted && (
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </Button>
          )}
          {status === "authenticated" ? (
            <Button onClick={() => signOut({ callbackUrl: "/" })} variant="secondary">Sign out</Button>
          ) : (
            <>
              <Button onClick={() => signIn()} variant="secondary">Log in</Button>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}