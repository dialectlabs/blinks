import type { SVGProps } from 'react';
export const DeepLinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={10}
    fill="none"
    viewBox="0 0 10 10"
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2.5 1h1.793v1H2.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V5.707h1V7.5A1.5 1.5 0 0 1 7.5 9h-5A1.5 1.5 0 0 1 1 7.5v-5A1.5 1.5 0 0 1 2.5 1Z"
    />
    <path
      fill="currentColor"
      d="M9 4H8V2.708l-3 3L4.293 5l3-3H6V1h2.5a.5.5 0 0 1 .5.5V4Z"
    />
  </svg>
);
