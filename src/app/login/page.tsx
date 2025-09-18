"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    setLoading(true);
    
    const result = await signIn("email-password", { 
      email, 
      password, 
      callbackUrl: "/post-login",
      redirect: false 
    });
    
    if (result?.error) {
      toast.error("Invalid email or password");
    } else if (result?.ok) {
      toast.success("Welcome back!");
      window.location.href = "/post-login";
    }
    
    setLoading(false);
  }

  async function onPhoneSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const otp = (form.elements.namedItem("otp") as HTMLInputElement)?.value;
    
    if (!showOtpInput) {
      // Send OTP
      setOtpLoading(true);
      setPhoneNumber(phone);
      
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          toast.success("OTP sent to your WhatsApp!");
          setShowOtpInput(true);
        } else {
          toast.error(data.error || "Failed to send OTP");
        }
      } catch (error) {
        toast.error("Failed to send OTP");
      }
      
      setOtpLoading(false);
    } else {
      // Verify OTP and login
      setLoading(true);
      
      const result = await signIn("phone-otp", { 
        phone: phoneNumber, 
        otp, 
        callbackUrl: "/post-login",
        redirect: false 
      });
      
      if (result?.error) {
        toast.error("Invalid OTP or OTP expired");
      } else if (result?.ok) {
        toast.success("Welcome back!");
        window.location.href = "/post-login";
      }
      
      setLoading(false);
    }
  }

  const handleGoogleSignIn = () => {
    toast.loading("Signing in with Google...");
    signIn("google", { callbackUrl: "/post-login" });
  };

  const resetPhoneLogin = () => {
    setShowOtpInput(false);
    setPhoneNumber('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {setLoginMethod('email'); resetPhoneLogin();}}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {setLoginMethod('phone'); resetPhoneLogin();}}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Phone
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={onEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in with Email"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onPhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  disabled={showOtpInput}
                  defaultValue={phoneNumber}
                />
              </div>
              
              {showOtpInput && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OTP
                  </label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP sent via SMS. Check your messages.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || otpLoading}
                >
                  {otpLoading ? "Sending OTP..." : loading ? "Verifying..." : showOtpInput ? "Verify & Sign in" : "Send OTP"}
                </Button>
                {showOtpInput && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetPhoneLogin}
                  >
                    Change Number
                  </Button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="secondary"
              className="w-full mt-4"
            >
              Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
          
          <p className="mt-2 text-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}