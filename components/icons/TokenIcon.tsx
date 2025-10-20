import React from 'react';

export const TokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v1.1a5 5 0 0 1 0 7.8V17" />
    <path d="M15.41 8.59 14 10" />
    <path d="m10 14-1.41 1.41" />
    <path d="M10 10 8.59 8.59" />
    <path d="M14 14l1.41 1.41" />
  </svg>
);
