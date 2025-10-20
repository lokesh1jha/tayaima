"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input-enhanced";
import { cn } from "@/lib/utils";
import { IconBrandGoogle, IconMail, IconPhone } from "@tabler/icons-react";

type Props = {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogle?: () => void;
  loading?: boolean;
};

export default function SignupFormDemo({ onSubmit, onGoogle, loading }: Props) {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

 
  const handleTabChange = (mode: 'email' | 'phone') => {
    setAuthMode(mode);
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

      {/* Auth Mode Tabs - Phone tab disabled */}
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
          disabled
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
        >
          <IconPhone className="h-4 w-4" />
          Phone (Coming Soon)
        </button>
      </div>

      <form className="my-8" onSubmit={onSubmit}>
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
