import type { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    viewBox="0 0 16 16"
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.6 5.398a.85.85 0 0 1-.001 1.202l-4.784 4.773a.85.85 0 0 1-1.193.008L3.934 8.77a.85.85 0 0 1 1.184-1.22l2.088 2.027 4.192-4.182a.85.85 0 0 1 1.202.002Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgComponent;
