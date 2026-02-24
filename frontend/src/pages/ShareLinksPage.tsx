import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ArrowLeft, Store, Building2, User } from 'lucide-react';
import ShareLinkCard from '../components/ShareLinkCard';

export default function ShareLinksPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Please login to view share links</p>
      </div>
    );
  }

  const weaverPrincipal = identity.getPrincipal().toString();
  const baseUrl = window.location.origin;

  const links = [
    {
      title: 'Retail Customers',
      description: 'Share this link with your retail customers',
      url: `${baseUrl}/#/catalog/${weaverPrincipal}/retail`,
      icon: <Store className="w-6 h-6" />,
    },
    {
      title: 'Wholesale Customers',
      description: 'Share this link with your wholesale customers',
      url: `${baseUrl}/#/catalog/${weaverPrincipal}/wholesale`,
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: 'Direct Customers',
      description: 'Share this link with your direct customers',
      url: `${baseUrl}/#/catalog/${weaverPrincipal}/direct`,
      icon: <User className="w-6 h-6" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Share Your Catalog</h1>
        <p className="text-muted-foreground">
          Generate and share unique links for different customer types. Each link shows only the products visible to that customer type.
        </p>
      </div>

      <div className="space-y-6">
        {links.map((link, index) => (
          <ShareLinkCard
            key={index}
            title={link.title}
            description={link.description}
            url={link.url}
            icon={link.icon}
          />
        ))}
      </div>

      <div className="mt-8 p-6 bg-muted/50 border border-border rounded-xl">
        <h3 className="font-serif font-semibold text-foreground mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Each link is unique to your account and customer type</li>
          <li>• Links work without requiring customers to log in</li>
          <li>• Products are filtered based on their visibility settings</li>
          <li>• Links remain active permanently</li>
        </ul>
      </div>
    </div>
  );
}
