export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper-50 text-ink-900" dir="rtl">
      {children}
    </div>
  );
}
