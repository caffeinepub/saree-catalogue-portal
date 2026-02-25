import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface ShareLinkCardProps {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
}

export default function ShareLinkCard({ title, description, url, icon }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E07A5F] to-[#C1403D] flex items-center justify-center text-white flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-lg text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="bg-muted rounded-lg p-3 mb-3 break-all text-sm text-foreground font-mono">
        {url}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium transition-all shadow-md hover:shadow-lg"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white font-medium transition-all shadow-md hover:shadow-lg"
        >
          <SiWhatsapp className="w-4 h-4" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
