import Image from "next/image";
import Link from "next/link";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Solutions", href: "#solutions" },
      { label: "How we work", href: "#how-we-work" },
      { label: "Partners", href: "#partners" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Insights", href: "#insights" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 md:gap-8">
          <div>
            <div className="h-9 overflow-hidden mb-4">
              <Image
                src="/logo.png"
                alt="InnoCare X"
                width={200}
                height={72}
                className="h-14 w-auto max-w-none"
                style={{ transform: "translateY(3%)" }}
              />
            </div>
            <p className="font-semibold text-white/90 mb-2">
              Operational Ownership. Cost Discipline. Sustainable Growth.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              UAE health insurance distribution platform for brokers, typing centres, and corporate partners.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-brand-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">{c.title}</h3>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between gap-4 text-slate-600 text-sm">
          <span>© {new Date().getFullYear()} InnoCare X. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
