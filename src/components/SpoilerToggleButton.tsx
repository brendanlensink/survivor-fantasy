"use client";

import { useState } from "react";
import { toggleSpoilerMode } from "@/lib/spoilerModeActions";

export default function SpoilerToggleButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await toggleSpoilerMode();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={`${className ?? ""} ${pending ? "opacity-60 cursor-wait" : ""}`}
    >
      {pending ? "…" : children}
    </button>
  );
}
