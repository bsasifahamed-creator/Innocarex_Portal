interface SectionLabelProps {
  text: string;
  className?: string;
}

export default function SectionLabel({ text, className = "" }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <div className="w-8 h-[2px] bg-brand-blue shrink-0" />
      <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-500">
        {text}
      </span>
    </div>
  );
}
