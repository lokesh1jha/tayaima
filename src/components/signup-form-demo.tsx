"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input-enhanced";
import { cn } from "@/lib/utils";
import { IconBrandGoogle, IconMail, IconPhone } from "@tabler/icons-react";
import { toast } from "sonner";

type Props = {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogle?: () => void;
  loading?: boolean;
};

export default function SignupFormDemo({ onSubmit, onGoogle, loading }: Props) {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    // Basic phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        startCountdown();
        toast.success('OTP sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send OTP');
        if (data.cooldownUntil) {
          const cooldownTime = new Date(data.cooldownUntil).toLocaleTimeString();
          toast.error(`Please try again after ${cooldownTime}`);
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          otp,
          isSignup: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        window.location.href = '/dashboard';
      } else {
        toast.error(data.error || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const resetPhoneForm = () => {
    setPhone('');
    setOtp('');
    setStep('phone');
    setCountdown(0);
  };

  const handleTabChange = (mode: 'email' | 'phone') => {
    setAuthMode(mode);
    if (mode === 'phone') {
      resetPhoneForm();
    }
  };
  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/tayaima-logo.jpeg"
            alt="TaYaima Logo"
            width={48}
            height={48}
            className="rounded-lg object-contain"
          />
          <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
            TaYaima
          </span>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
        Welcome to TaYaima
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center mx-auto">
        Create your account to start shopping for fresh groceries and daily essentials
      </p>

      {/* Auth Mode Tabs */}
      <div className="flex mt-6 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => handleTabChange('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            authMode === 'email'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <IconMail className="h-4 w-4" />
          Email
        </button>
        <button
          onClick={() => handleTabChange('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            authMode === 'phone'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <IconPhone className="h-4 w-4" />
          Phone
        </button>
      </div>

      <form className="my-8" onSubmit={authMode === 'email' ? onSubmit : undefined}>
        {authMode === 'email' ? (
          <>
            <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input id="firstname" name="firstname" placeholder="John" type="text" required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" name="lastname" placeholder="Doe" type="text" required />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" placeholder="john@example.com" type="email" required />
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" placeholder="••••••••" type="password" required />
            </LabelInputContainer>
            <LabelInputContainer className="mb-8">
              <Label htmlFor="confirmpassword">Confirm Password</Label>
              <Input
                id="confirmpassword"
                name="confirmpassword"
                placeholder="••••••••"
                type="password"
                required
              />
            </LabelInputContainer>

            <button
              className="group/btn relative block h-10 w-full rounded-md bg-green-500 hover:bg-green-600 font-medium text-white transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up →"}
            </button>
          </>
        ) : (
          <>
            {step === 'phone' ? (
              <>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <LabelInputContainer>
                    <Label htmlFor="firstname">First name</Label>
                    <Input id="firstname" name="firstname" placeholder="John" type="text" required />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="lastname">Last name</Label>
                    <Input id="lastname" name="lastname" placeholder="Doe" type="text" required />
                  </LabelInputContainer>
                </div>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="Enter 10-digit phone number" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required 
                  />
                </LabelInputContainer>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !phone.trim() || phone.length !== 10}
                  className="group/btn relative block h-10 w-full rounded-md bg-green-500 hover:bg-green-600 font-medium text-white transition-colors"
                >
                  {otpLoading ? "Sending..." : "Send OTP →"}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    OTP sent to <span className="font-semibold">+91 {phone}</span>
                  </p>
                </div>

                <LabelInputContainer className="mb-4">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input 
                    id="otp" 
                    name="otp" 
                    placeholder="Enter 6-digit OTP" 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required 
                  />
                </LabelInputContainer>

                <div className="mb-4 flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || !otp.trim() || otp.length !== 6}
                    className="group/btn relative block h-10 w-full rounded-md bg-green-500 hover:bg-green-600 font-medium text-white transition-colors"
                  >
                    {otpLoading ? "Verifying..." : "Verify OTP →"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-sm text-neutral-600 dark:text-neutral-300 hover:underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-red-500 hover:bg-red-600 px-4 font-medium text-white transition-colors"
            type="button"
            onClick={onGoogle}
          >
            <IconBrandGoogle className="h-4 w-4 text-white" />
            <span className="text-sm text-white">
              Continue with Google
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
