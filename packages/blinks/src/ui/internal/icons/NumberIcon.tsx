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
      d="M11.721 1a.75.75 0 0 0-.745.664l-.299 2.586h-4.5l.28-2.42a.745.745 0 0 0-1.48-.17l-.3 2.59H1.75a.75.75 0 0 0 0 1.5H4.5l-.515 4.5H1.75a.75.75 0 0 0 0 1.5h2.063l-.28 2.42a.745.745 0 1 0 1.48.17l.3-2.59h4.5l-.28 2.42a.745.745 0 0 0 1.48.17l.3-2.59h2.937a.75.75 0 0 0 0-1.5H11.5l.52-4.5h2.23a.75.75 0 0 0 0-1.5h-2.063l.279-2.414A.75.75 0 0 0 11.721 1Zm-1.736 9.25H5.5l.52-4.5h4.48l-.515 4.5Z"
    />
  </svg>
);
export default SvgComponent;
