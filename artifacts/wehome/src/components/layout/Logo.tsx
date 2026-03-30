interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = "", height = 40 }: LogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/wehome-logo.png`}
      alt="WeHome"
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
    />
  );
}
