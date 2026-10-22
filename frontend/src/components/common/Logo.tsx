import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 36, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="url(#pv_logo_grad)" />
      {/* Upward dynamic geometric crest representing growth & compensation */}
      <path
        d="M14 25L24 15L34 25"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 31L24 24L31 31"
        stroke="url(#pv_emerald_grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="11" r="2.5" fill="#38BDF8" />
      <defs>
        <linearGradient
          id="pv_logo_grad"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563EB" />
          <stop offset="0.5" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient
          id="pv_emerald_grad"
          x1="17"
          y1="24"
          x2="31"
          y2="31"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );
}
