import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from './LoginButton';
import CustomerTypeDialog from './CustomerTypeDialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile } from '../hooks/useQueries';

export default function ResponsiveNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: weaverProfile } = useGetCallerProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const weaverPrincipal = identity?.getPrincipal().toString();

  const navLinks = isAuthenticated
    ? [
        { to: '/catalog', label: 'Catalogue' },
        { to: '/customers', label: 'Customers' },
        { to: '/share-links', label: 'Share Links' },
        { to: '/profile', label: 'Profile' },
      ]
    : [];

  const handleShareCatalogueSelect = (customerType: string) => {
    if (!weaverPrincipal) return;
    const base = window.location.origin + window.location.pathname;
    const url = `${base}#/public-catalog/${weaverPrincipal}/${customerType}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareDialogOpen(false);
    navigate({ to: '/share-links' });
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3">
          {weaverProfile?.logo ? (
            <img
              src={weaverProfile.logo.getDirectURL()}
              alt="Weaver Logo"
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <span className="text-2xl">🧵</span>
          )}
          <span className="font-serif font-bold text-lg text-foreground hidden sm:block">
            {weaverProfile?.name || 'Weaver Portal'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              activeProps={{ className: 'px-3 py-2 text-sm text-foreground font-medium rounded-md bg-muted' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && weaverPrincipal && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
          <LoginButton />
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && weaverPrincipal && (
            <button
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors text-left flex items-center gap-2"
              onClick={() => { setMobileOpen(false); setShareDialogOpen(true); }}
            >
              <Share2 className="w-4 h-4" />
              Share Catalogue
            </button>
          )}
        </div>
      )}

      {/* Share catalogue dialog */}
      <CustomerTypeDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onSelect={handleShareCatalogueSelect}
        title="Share Catalogue"
        description="Select the customer type to generate a share link"
      />
    </header>
  );
}
