export default function HomeLogo({ width = "100%", height = "100%" }: { width?: string | number, height?: string | number }) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 500 500"
      preserveAspectRatio="xMidYMid meet">
      <rect width="99%" height="99%" fill="white" />
      <g transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)" stroke="none">
        <path
          fill="#000000"
          d="M0 2500 l0 -2500 2500 0 2500 0 0 2500 0 2500 -2500 0 -2500 0 0
-2500z m2420 821 c85 -85 174 -173 198 -195 l43 -40 90 90 89 89 745 -745
c410 -410 745 -748 745 -752 0 -5 -210 -8 -467 -8 l-468 0 130 -130 130 -130
-1495 0 -1495 0 250 250 250 250 -208 0 c-114 0 -207 3 -207 7 0 5 334 342
742 750 625 625 744 740 758 730 8 -6 85 -81 170 -166z"
        />
        <path
          fill="#000000"
          d="M1875 2750 l-280 -280 565 0 565 0 -280 280 c-154 154 -282 280 -285
280 -3 0 -131 -126 -285 -280z"
        />
        <path
          fill="#000000"
          d="M2170 2282 c0 -4 126 -133 280 -287 l280 -280 280 280 c154 154 280
283 280 287 0 5 -252 8 -560 8 -308 0 -560 -3 -560 -8z"
        />
      </g>
    </svg>
  );
}
