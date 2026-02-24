import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';
import { CustomerType, Product } from '../backend';
import { useActor } from '../hooks/useActor';
import { useWeaverProfile } from '../hooks/useQueries';
import { Image as ImageIcon } from 'lucide-react';

export default function PublicCatalogPage() {
  const { weaverId, customerType } = useParams({ strict: false });
  const { actor } = useActor();

  const weaverPrincipal = weaverId ? Principal.fromText(weaverId) : undefined;

  const { data: weaverProfile } = useWeaverProfile(weaverPrincipal);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['publicCatalog', weaverId, customerType],
    queryFn: async () => {
      if (!actor || !weaverPrincipal || !customerType) return [];
      const type = customerType as CustomerType;
      return actor.getPublicCatalog(weaverPrincipal, CustomerType[type]);
    },
    enabled: !!actor && !!weaverPrincipal && !!customerType,
  });

  const getPriceForCustomerType = (product: Product): string => {
    if (!customerType) return '';
    switch (customerType) {
      case 'retail':
        return product.retailPrice.toString();
      case 'wholesale':
        return product.wholesalePrice.toString();
      case 'direct':
        return product.directPrice.toString();
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {weaverProfile?.logo && (
              <img
                src={weaverProfile.logo.getDirectURL()}
                alt="Weaver Logo"
                className="w-16 h-16 object-cover rounded-full border-2 border-primary"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {weaverProfile?.name || 'Weaver'} Catalog
              </h1>
              <p className="text-muted-foreground capitalize">
                {customerType} Customer Pricing
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayImage = product.images && product.images.length > 0 ? product.images[0] : null;
              
              return (
                <div
                  key={product.id.toString()}
                  className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {displayImage ? (
                      <img
                        src={displayImage.getDirectURL()}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    {product.madeToOrder && (
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
                        Made to Order
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {product.id.toString()}</p>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₹{getPriceForCustomerType(product)}
                      </span>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.availableQuantity > 0n
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.availableQuantity > 0n ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>

                    {product.colors && product.colors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Available Colors:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.colors.map((color) => (
                            <div
                              key={color.hex}
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {weaverProfile?.name || 'Weaver'}. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
