import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ArrowRight } from 'lucide-react';
import FeatureSection from '../components/FeatureSection';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#E07A5F]/10 via-background to-[#C1403D]/10 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                Share Your Craft with the World
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                A modern platform for Indian weavers to showcase their beautiful sarees and connect with customers across retail, wholesale, and direct channels.
              </p>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate({ to: '/catalog' })}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  Go to Catalog
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="text-muted-foreground">
                  <p className="mb-4">Get started by logging in with your account</p>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src="/assets/generated/weaving-hero.dim_1200x600.png"
                  alt="Traditional Indian weaving"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#F2A154] to-[#E07A5F] rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#C1403D] to-[#E07A5F] rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#E07A5F] to-[#C1403D]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to Showcase Your Sarees?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join weavers across India who are modernizing their business with our platform
          </p>
          {!isAuthenticated && (
            <p className="text-white/80">Login to get started</p>
          )}
        </div>
      </section>
    </div>
  );
}
