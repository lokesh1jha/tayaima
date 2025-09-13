"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  }

  return (
    <div className="container py-16 max-w-md">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <Input name="email" type="email" label="Email" required />
        <Input name="password" type="password" label="Password" required />
        <Button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</Button>
        <Button type="button" variant="secondary" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Continue with Google
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        No account? <Link className="underline" href="/signup">Sign up</Link>
      </p>
    </div>
  );
}