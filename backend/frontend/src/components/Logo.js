import React from "react";

export const LogoMark = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon
      points="18,2 32,10 32,26 18,34 4,26 4,10"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <polygon
      points="18,8 26,18 18,28 10,18"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.15"
    />
  </svg>
);

export default LogoMark;
