"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import LoginFormDemo from "@/components/login-form-demo";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for session expiry message using utility function
    const { checkAndClearSessionExpiry } = require('@/lib/sessionUtils');
    if (checkAndClearSessionExpiry()) {
      toast.error('Your session has expired. Please log in again.');
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    setLoading(true);
    setError(null);
    
    const result = await signIn("credentials", { 
      email, 
      password, 
      callbackUrl: "/post-login",
      redirect: false 
    });
    
    if (result?.error) {
      const errorMessage = "Invalid email or password";
      setError(errorMessage);
      toast.error(errorMessage);
    } else if (result?.ok) {
      toast.success("Welcome back!");
      window.location.href = "/post-login";
    }
    
    setLoading(false);
  }

  const handleGoogleSignIn = () => {
    toast.loading("Signing in with Google...");
    signIn("google", { callbackUrl: "/post-login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginFormDemo onSubmit={onSubmit} onGoogle={handleGoogleSignIn} loading={loading} />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          No account? <Link className="underline hover:text-gray-900 dark:hover:text-white" href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}