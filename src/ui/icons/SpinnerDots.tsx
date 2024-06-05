import { useMemo } from 'react';

const POINTS = [0, 45, 90, 135, 180, 225, 270, 315];

export const SpinnerDots = ({
  width = 16,
}: {
  width?: number;
  height?: number;
}) => {
  const dots = useMemo(
    () =>
      POINTS.map((point, index) => (
        <circle
          cy={12}
          cx={12}
          r={4}
          key={point}
          transform={`rotate(${point}, 24, 24)`}
          // fillOpacity={(1 / POINTS.length) * (index + 1)}
          fillOpacity={index < 2 ? 0 : 1}
        />
      )),
    [],
  );
  return (
    <>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <svg
        viewBox="0 0 48 48"
        width={width}
        fill="currentColor"
        data-testid="rotating-dots-svg"
        aria-label="rotating-dots-loading"
        style={{
          animationDuration: '1s',
          animation: 'spin 1s steps(8, end) infinite',
        }}
      >
        {dots}
      </svg>
    </>
  );
};
