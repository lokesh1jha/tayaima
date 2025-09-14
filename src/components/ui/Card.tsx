import React from "react";
import clsx from "clsx";

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "kirana-card",
        className
      )}
    >
      {children}
    </div>
  );
}