/**
 * TODO: PHONE AUTHENTICATION - CURRENTLY DISABLED
 * 
 * This component provides phone-based authentication using OTP.
 * It is currently disabled and will be enabled in the future.
 * 
 * DO NOT USE THIS COMPONENT until SMS service is enabled.
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';

interface PhoneAuthFormProps {
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
  hideSwitchMode?: boolean;
}

export default function PhoneAuthForm({ mode, onSwitchMode, hideSwitchMode = false }: PhoneAuthFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const isSignup = mode === 'signup';

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

    setLoading(true);
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
        setOtpSent(true);
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
      setLoading(false);
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

    if (isSignup && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          otp,
          name: isSignup ? name : undefined,
          isSignup,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sign in with NextAuth
        const result = await signIn('phone-otp', {
          phone,
          otp,
          redirect: false,
        });

        if (result?.ok) {
          toast.success(isSignup ? 'Account created successfully!' : 'Login successful!');
          router.push('/dashboard');
        } else {
          toast.error('Authentication failed. Please try again.');
        }
      } else {
        toast.error(data.error || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const resetForm = () => {
    setPhone('');
    setOtp('');
    setName('');
    setStep('phone');
    setOtpSent(false);
    setCountdown(0);
  };

  const handleSwitchMode = () => {
    resetForm();
    onSwitchMode();
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isSignup ? 'Sign Up' : 'Login'} with Phone
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isSignup 
              ? 'Create your account using your phone number' 
              : 'Enter your phone number to login'
            }
          </p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your 10-digit Indian mobile number
              </p>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            <Button
              onClick={handleSendOtp}
              disabled={loading || !phone.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                OTP sent to <span className="font-semibold">+91 {phone}</span>
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !otp.trim() || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : isSignup ? 'Create Account' : 'Login'}
              </Button>

              <Button
                variant="secondary"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="w-full"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}

        {hideSwitchMode ? (
          <div className="text-center">
            <button
              onClick={onSwitchMode}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline"
            >
              Back to Email Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={handleSwitchMode}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
