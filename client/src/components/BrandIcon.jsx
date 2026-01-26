import React from 'react';

const BrandIcon = ({ size = 32 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={size}
    height={size}
  >
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#a6f3e0" />
        <stop offset="1" stopColor="#5de6c6" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#0f172a" />
    <path d="M32 14l18 14v20a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V28l18-14z" fill="url(#g)" />
    <path d="M28 48V28h8v20" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default BrandIcon;
