"use client";

import React from "react";
import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ className, label, error, ...props }: InputProps) {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>}
      <input
        className={clsx(
          "h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}