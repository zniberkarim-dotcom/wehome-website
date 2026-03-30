interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = "", height = 40 }: LogoProps) {
  const aspectRatio = 3.4;
  const width = height * aspectRatio;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 85"
      width={width}
      height={height}
      className={className}
      aria-label="WeHome"
    >
      {/* "we" - burgundy, lighter weight */}
      <text
        x="0"
        y="68"
        fontFamily="'Outfit', sans-serif"
        fontSize="64"
        fontWeight="300"
        fill="#8B1A3A"
        letterSpacing="1"
      >
        we
      </text>

      {/* "h" - dark charcoal */}
      <text
        x="89"
        y="68"
        fontFamily="'Outfit', sans-serif"
        fontSize="64"
        fontWeight="400"
        fill="#3C4555"
        letterSpacing="1"
      >
        h
      </text>

      {/* Magnifying glass replacing "o" - burgundy */}
      <circle
        cx="163"
        cy="49"
        r="17"
        fill="none"
        stroke="#8B1A3A"
        strokeWidth="4.5"
      />
      <line
        x1="175"
        y1="62"
        x2="190"
        y2="80"
        stroke="#8B1A3A"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* "me" - dark charcoal */}
      <text
        x="191"
        y="68"
        fontFamily="'Outfit', sans-serif"
        fontSize="64"
        fontWeight="400"
        fill="#3C4555"
        letterSpacing="1"
      >
        me
      </text>
    </svg>
  );
}
