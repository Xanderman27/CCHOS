import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard - Children's Community Health",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ihc-surface">
      <header className="bg-ihc-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img src="/logo-dark.png" alt="Intermountain Health" className="h-7 w-auto shrink-0" />
              <h1 className="text-sm sm:text-base font-semibold text-white truncate">
                Children&apos;s Community Health
              </h1>
              <span className="hidden sm:inline text-xs text-ihc-light border-l border-ihc-light/30 pl-4">
                Admin Dashboard
              </span>
            </div>
            <a
              href="/"
              className="text-xs sm:text-sm text-ihc-light hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              View Form
            </a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
