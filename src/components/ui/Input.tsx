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
          "kirana-input h-10",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}