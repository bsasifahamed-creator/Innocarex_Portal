import PortalHeader from "@/components/portal/PortalHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body">
      <PortalHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">{children}</main>
    </div>
  );
}
