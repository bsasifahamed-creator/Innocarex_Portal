interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  className?: string;
}

export default function GradientText({
  children,
  from = "from-brand-blue",
  to = "to-primary",
  className = "",
}: GradientTextProps) {
  return (
    <span
      className={`text-transparent bg-clip-text bg-gradient-to-r ${from} ${to} ${className}`}
    >
      {children}
    </span>
  );
}
