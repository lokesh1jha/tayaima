"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import SignupFormDemo from "@/components/signup-form-demo";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstname = (form.elements.namedItem("firstname") as HTMLInputElement).value;
    const lastname = (form.elements.namedItem("lastname") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmpassword = (form.elements.namedItem("confirmpassword") as HTMLInputElement).value;

    if (password !== confirmpassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: `${firstname} ${lastname}`.trim(), 
        email, 
        password 
      }),
    });

    if (res.ok) {
      toast.success("Account created successfully! Please log in.");
      window.location.href = "/login";
    } else {
      const data = await res.json().catch(() => ({}));
      const errorMessage = data?.error ?? "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignupFormDemo onSubmit={onSubmit} />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account? <Link className="underline hover:text-gray-900 dark:hover:text-white" href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}