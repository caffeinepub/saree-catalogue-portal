import { useParams } from "@tanstack/react-router";
import { CustomerType } from "../backend";
import { useGetPublicProduct } from "../hooks/useQueries";
import ImageGallery from "../components/ImageGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft } from "lucide-react";

function parseCustomerType(raw: string): CustomerType {
  if (raw === "wholesale") return CustomerType.wholesale;
  if (raw === "direct") return CustomerType.direct;
  return CustomerType.retail;
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function PublicProductDetailPage() {
  const {
    weaverId,
    productId: productIdRaw,
    customerType: customerTypeRaw,
  } = useParams({
    from: "/public-layout/public-product/$weaverId/$productId/$customerType",
  });

  const customerType = parseCustomerType(customerTypeRaw);

  let productId: bigint | null = null;
  try {
    productId = BigInt(productIdRaw || "0");
  } catch {
    // invalid product id
  }

  const { data: product, isLoading } = useGetPublicProduct(
    productId,
    weaverId || null
  );

  const price = product
    ? customerType === CustomerType.wholesale
      ? product.wholesalePrice
      : customerType === CustomerType.direct
      ? product.directPrice
      : product.retailPrice
    : 0n;

  const inStock = product
    ? product.availableQuantity > 0n || product.madeToOrder
    : false;

  const customerTypeLabel =
    customerType === CustomerType.wholesale
      ? "Wholesale"
      : customerType === CustomerType.direct
      ? "Direct"
      : "Retail";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Self-contained header — no auth required */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                Product Details
              </h1>
              <p className="text-xs text-muted-foreground">
                {customerTypeLabel} Pricing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!weaverId || productId === null ? (
          <div className="text-center py-16">
            <p className="text-destructive font-medium">Invalid product link.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ) : !product ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Product not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image gallery */}
            <div>
              {product.images && product.images.length > 0 ? (
                <ImageGallery images={product.images} />
              ) : (
                <div className="h-80 bg-muted rounded-xl flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(price)}
                  </span>
                  <Badge variant={inStock ? "default" : "secondary"}>
                    {product.madeToOrder
                      ? "Made to Order"
                      : inStock
                      ? "In Stock"
                      : "Out of Stock"}
                  </Badge>
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Description
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Available Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full border border-border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-foreground">
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!product.madeToOrder && product.availableQuantity > 0n && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Available Quantity
                  </h3>
                  <p className="text-foreground">
                    {Number(product.availableQuantity)} units
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-muted-foreground">
          Built with <span className="text-destructive">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname || "unknown-app"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
