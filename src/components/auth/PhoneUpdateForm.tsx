/**
 * TODO: PHONE UPDATE FEATURE - CURRENTLY DISABLED
 * 
 * This component allows users to update their phone number.
 * It is currently disabled and will be enabled in the future.
 * 
 * DO NOT USE THIS COMPONENT until SMS service is enabled.
 */

'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';

interface PhoneUpdateFormProps {
  currentPhone?: string | null;
  onUpdate: (phone: string) => void;
  onCancel: () => void;
}

export default function PhoneUpdateForm({ currentPhone, onUpdate, onCancel }: PhoneUpdateFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
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
          isSignup: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Phone number verified successfully!');
        onUpdate(phone);
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
    setStep('phone');
    setCountdown(0);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Update Phone Number
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {currentPhone 
              ? `Current: +91 ${currentPhone}` 
              : 'Add a phone number to your account'
            }
          </p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Phone Number
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

            <div className="flex space-x-3">
              <Button
                onClick={handleSendOtp}
                disabled={loading || !phone.trim()}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
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

            <div className="flex space-x-3">
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !otp.trim() || otp.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify & Update'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
