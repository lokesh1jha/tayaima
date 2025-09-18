"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstname = (form.elements.namedItem("firstname") as HTMLInputElement).value;
    const lastname = (form.elements.namedItem("lastname") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmpassword = (form.elements.namedItem("confirmpassword") as HTMLInputElement).value;

    // Validation
    if (!email.trim() && !phone.trim()) {
      toast.error("Please provide either email or phone number");
      return;
    }

    if (password !== confirmpassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: `${firstname} ${lastname}`.trim(), 
        email: email.trim() || null, 
        phone: phone.trim() || null,
        password 
      }),
    });

    if (res.ok) {
      toast.success("Account created successfully! Please log in.");
      window.location.href = "/login";
    } else {
      const data = await res.json().catch(() => ({}));
      const errorMessage = data?.error ?? "Something went wrong";
      toast.error(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join Kirana Store today</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <Input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email (optional)"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number (optional)"
              />
            </div>

            <p className="text-xs text-gray-500">
              * At least one of email or phone number is required
            </p>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password *
              </label>
              <Input
                id="confirmpassword"
                name="confirmpassword"
                type="password"
                required
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}