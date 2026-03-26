export default function SowCriteriaList({ criteria, id }: { criteria: string[]; id: string }) {
  return (
    <details className="mt-1 group">
      <summary className="text-xs cursor-pointer text-brand-blue font-medium list-none flex items-center gap-1">
        <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
        SOW criteria ({criteria.length})
      </summary>
      <ul id={id} className="mt-2 pl-4 space-y-0.5 list-disc text-xs text-slate-600 border-l-2 border-slate-200 ml-1">
        {criteria.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </details>
  );
}
