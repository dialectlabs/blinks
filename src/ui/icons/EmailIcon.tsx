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
      d="M1.361 2.685a.764.764 0 0 0-.157.227A2.986 2.986 0 0 0 .75 4.5v7a3 3 0 0 0 3 3h8.5a3 3 0 0 0 3-3v-7c0-.583-.166-1.128-.454-1.588a.75.75 0 0 0-.157-.227A2.995 2.995 0 0 0 12.25 1.5h-8.5c-.975 0-1.841.465-2.389 1.185ZM3.75 3h8.5c.27 0 .522.071.74.195L8.815 6.817a1.25 1.25 0 0 1-1.638-.001l-4.167-3.62C3.227 3.07 3.48 3 3.75 3Zm10 1.522V11.5a1.5 1.5 0 0 1-1.5 1.5h-8.5a1.5 1.5 0 0 1-1.5-1.5V4.524l3.942 3.424a2.75 2.75 0 0 0 3.605.002l3.953-3.428Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgComponent;
