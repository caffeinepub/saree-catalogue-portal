import { useGetCallerProfile } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { CustomerType } from "../backend";
import { buildCatalogShareUrl } from "../utils/urlParams";
import ShareLinkCard from "../components/ShareLinkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Info, ShoppingBag, Users, Truck } from "lucide-react";

export default function ShareLinksPage() {
  const { identity } = useInternetIdentity();
  const { isLoading } = useGetCallerProfile();

  const weaverId = identity?.getPrincipal().toString() ?? "";

  const retailUrl = buildCatalogShareUrl(weaverId, CustomerType.retail);
  const wholesaleUrl = buildCatalogShareUrl(weaverId, CustomerType.wholesale);
  const directUrl = buildCatalogShareUrl(weaverId, CustomerType.direct);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
          Share Your Catalog
        </h1>
        <p className="text-muted-foreground text-sm">
          Share these links with your customers. Each link shows pricing
          appropriate for that customer type.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <ShareLinkCard
            title="Retail Catalog"
            description="Share with retail customers — shows retail pricing"
            url={retailUrl}
            icon={<ShoppingBag className="w-6 h-6" />}
          />
          <ShareLinkCard
            title="Wholesale Catalog"
            description="Share with wholesale buyers — shows wholesale pricing"
            url={wholesaleUrl}
            icon={<Users className="w-6 h-6" />}
          />
          <ShareLinkCard
            title="Direct Catalog"
            description="Share with direct customers — shows direct pricing"
            url={directUrl}
            icon={<Truck className="w-6 h-6" />}
          />
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl border border-border bg-muted/30 flex gap-3">
        <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Sharing individual products
          </p>
          <p>
            You can also share links to individual products. Go to your{" "}
            <strong>Catalog</strong> page, click the{" "}
            <Share2 className="w-3.5 h-3.5 inline" /> share icon on any product
            card to get product-specific links for each customer type.
          </p>
        </div>
      </div>
    </div>
  );
}
