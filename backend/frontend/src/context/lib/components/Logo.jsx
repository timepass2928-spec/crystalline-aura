export function LogoMark({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="24,4 42,24 24,44 6,24"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polygon
        points="24,11 35,24 24,37 13,24"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.65"
      />
      <path
        d="M24 17V31M17 24H31"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span
      className={`font-serif tracking-[0.28em] uppercase select-none ${className}`}
    >
      Crystalline Aura
    </span>
  );
}
