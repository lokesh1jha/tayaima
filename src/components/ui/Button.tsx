"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
  } as const;
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}