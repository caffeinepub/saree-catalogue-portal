import { ReactNode } from 'react';
import ResponsiveNav from './ResponsiveNav';
import { Heart } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const appIdentifier = encodeURIComponent(window.location.hostname || 'weaver-catalog');
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ResponsiveNav />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} Weaver Catalog Portal</p>
        </div>
      </footer>
    </div>
  );
}
