import { type SVGProps } from 'react';
export const LinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    viewBox="0 0 16 16"
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <g fill="currentColor" clipPath="url(#a)">
      <path d="M7.409 9.774 9.774 7.41a.836.836 0 1 0-1.183-1.183L6.226 8.592A.836.836 0 1 0 7.41 9.774Z" />
      <path d="M10.76.503A4.709 4.709 0 0 0 7.41 1.889L5.83 3.467A.836.836 0 1 0 7.014 4.65L8.59 3.072a3.067 3.067 0 0 1 4.338 4.337L11.35 8.987a.835.835 0 1 0 1.182 1.182l1.578-1.577a4.738 4.738 0 0 0-3.35-8.09ZM5.24 15.497a4.706 4.706 0 0 0 3.351-1.386l1.578-1.577a.836.836 0 1 0-1.182-1.183l-1.578 1.578a3.067 3.067 0 1 1-4.337-4.337L4.65 7.014A.836.836 0 1 0 3.467 5.83L1.889 7.41a4.737 4.737 0 0 0 3.351 8.088Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
