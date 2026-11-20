"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BloodLagbeLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function BloodLagbeLogo({
  size = "md",
  className = "",
}: BloodLagbeLogoProps) {
  const heights = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-12 sm:h-14",
  };

  const pixelDimensions = {
    sm: { width: 105, height: 35 },
    md: { width: 135, height: 45 },
    lg: { width: 195, height: 65 },
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none group transition-transform active:scale-[0.98] ${className}`}
      aria-label="BLOOD&LIFE - Return to Homepage"
    >
      <Image
        src="/logo.png"
        alt="BLOOD&LIFE"
        width={pixelDimensions[size].width}
        height={pixelDimensions[size].height}
        className={`${heights[size]} w-auto object-contain transition-transform group-hover:scale-[1.02] drop-shadow-sm dark:drop-shadow-[0_1px_12px_rgba(239,68,68,0.25)] dark:brightness-110 dark:contrast-105`}
        priority
      />
    </Link>
  );
}

export { BloodLagbeLogo as BloodAndLifeLogo };


