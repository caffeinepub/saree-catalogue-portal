import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPublicProduct, useWeaverProfile } from '../hooks/useQueries';
import { ArrowLeft, Package } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import ImageGallery from '../components/ImageGallery';

export default function PublicProductDetailPage() {
  const { weaverId, productId, customerType } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const parsedProductId = productId ? BigInt(productId) : 0n;
  const weaverPrincipal = weaverId ? Principal.fromText(weaverId) : undefined;
  
  const { data: product, isLoading } = useGetPublicProduct(
    parsedProductId,
    weaverPrincipal
  );

  // Fetch weaver profile for branding
  const { data: weaverProfile } = useWeaverProfile(weaverPrincipal);

  const brandName = weaverProfile?.name || 'Saree Catalog';
  const brandLogo = weaverProfile?.logo;

  // Determine which price to show based on customerType if provided
  const getPriceToDisplay = () => {
    if (!product) return null;
    
    if (customerType === 'retail') {
      return { label: 'Retail Price', value: Number(product.retailPrice) };
    } else if (customerType === 'wholesale') {
      return { label: 'Wholesale Price', value: Number(product.wholesalePrice) };
    } else if (customerType === 'direct') {
      return { label: 'Direct Price', value: Number(product.directPrice) };
    }
    
    // Show all prices if no specific customer type
    return null;
  };

  const specificPrice = getPriceToDisplay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">Product not found</h3>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = Number(product.availableQuantity) === 0 && !product.madeToOrder;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Branding */}
      <div className="bg-gradient-to-r from-[#E07A5F] to-[#C1403D] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            {brandLogo && (
              <img
                src={brandLogo.getDirectURL()}
                alt={brandName}
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-serif font-bold">{brandName}</h2>
              <p className="text-white/80 text-xs">Weaver's Collection</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Product Details</h1>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="relative">
              <ImageGallery images={product.images || []} />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                  <span className="text-white font-bold text-2xl">OUT OF STOCK</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-3xl font-serif font-bold text-foreground">
                    {product.name}
                  </h2>
                  <span className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    #{Number(product.id)}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground">
                  {product.description}
                </p>
              </div>

              {/* Colors Display */}
              {product.colors && product.colors.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-3">Available Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <div key={color.hex} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-foreground">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Pricing</h3>
                {specificPrice ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{specificPrice.label}:</span>
                    <span className="text-3xl font-bold text-[#E07A5F]">
                      ₹{specificPrice.value.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Retail Price:</span>
                      <span className="text-2xl font-bold text-[#E07A5F]">
                        ₹{Number(product.retailPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wholesale Price:</span>
                      <span className="text-2xl font-bold text-[#E07A5F]">
                        ₹{Number(product.wholesalePrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Direct Price:</span>
                      <span className="text-2xl font-bold text-[#E07A5F]">
                        ₹{Number(product.directPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-serif font-semibold text-foreground mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stock Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.availableQuantity > 0n
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.availableQuantity > 0n ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  {product.madeToOrder && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Made to Order:</span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent text-accent-foreground">
                        Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {brandName}. Built with ❤️ using{' '}
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
