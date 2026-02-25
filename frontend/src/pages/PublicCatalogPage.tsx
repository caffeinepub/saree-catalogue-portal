import { useParams } from "@tanstack/react-router";
import { Principal } from "@dfinity/principal";
import { CustomerType } from "../backend";
import { useGetPublicCatalog } from "../hooks/useQueries";
import ProductCard from "../components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

function parseCustomerType(raw: string): CustomerType {
  if (raw === "wholesale") return CustomerType.wholesale;
  if (raw === "direct") return CustomerType.direct;
  return CustomerType.retail;
}

export default function PublicCatalogPage() {
  const { weaverId, customerType: customerTypeRaw } = useParams({
    from: "/public-layout/public-catalog/$weaverId/$customerType",
  });

  const customerType = parseCustomerType(customerTypeRaw);

  let weaverPrincipal: Principal | null = null;
  try {
    weaverPrincipal = Principal.fromText(weaverId);
  } catch {
    // invalid principal
  }

  const { data: products = [], isLoading } = useGetPublicCatalog(
    weaverPrincipal,
    customerType
  );

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">
              Product Catalog
            </h1>
            <p className="text-xs text-muted-foreground">
              {customerTypeLabel} Pricing
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!weaverPrincipal ? (
          <div className="text-center py-16">
            <p className="text-destructive font-medium">Invalid catalog link.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="h-56 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No products available in this catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                customerType={customerType}
                weaverId={weaverId}
                isOwner={false}
                showOwnerControls={false}
              />
            ))}
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
