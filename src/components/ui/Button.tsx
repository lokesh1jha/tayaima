"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "success" | "warning" | "error";
};

export default function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2";
  
  const variants = {
    primary: "btn-primary focus:ring-green-200",
    secondary: "btn-secondary focus:ring-yellow-200", 
    accent: "btn-accent focus:ring-orange-200",
    success: "btn-success focus:ring-green-200",
    warning: "btn-warning focus:ring-orange-200", 
    error: "btn-error focus:ring-red-200",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-200",
  } as const;
  
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}