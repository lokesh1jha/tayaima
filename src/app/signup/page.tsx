"use client";

import { useState, FormEvent } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container py-16 max-w-md">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <Input name="name" label="Name" />
        <Input name="email" type="email" label="Email" required />
        <Input name="password" type="password" label="Password" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        Already have an account? <Link className="underline" href="/login">Log in</Link>
      </p>
    </div>
  );
}