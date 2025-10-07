
import React from 'react';

export const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 4V2" />
    <path d="M15 8V6" />
    <path d="M15 12V10" />
    <path d="M15 16V14" />
    <path d="M15 20V18" />
    <path d="M20 9.5 15 12 10 9.5" />
    <path d="M5 9.5 15 12 25 9.5" />
    <path d="m5 14.5 5.25-2.625" />
    <path d="m25 14.5-5.25-2.625" />
    <path d="m10 19 5-2.5 5 2.5" />
    <path d="M3.75 12 15 17l11.25-5" />
  </svg>
);
