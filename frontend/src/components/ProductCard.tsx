import { useState } from "react";
import { Product, CustomerType } from "../backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Share2,
  Copy,
  ExternalLink,
  Boxes,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  customerType?: CustomerType;
  weaverId?: string;
  isOwner?: boolean;
  /** When false, hides all owner-only controls (edit, delete, stock toggle, share). Defaults to same as isOwner. */
  showOwnerControls?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: bigint) => void;
  onToggleStock?: (productId: bigint) => void;
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function ProductCard({
  product,
  customerType,
  weaverId,
  isOwner = false,
  showOwnerControls,
  onEdit,
  onDelete,
  onToggleStock,
}: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Load first image URL
  const firstImage = product.images?.[0];
  if (firstImage && !imageLoaded) {
    const url = firstImage.getDirectURL();
    if (url && url !== imageUrl) {
      setImageUrl(url);
      setImageLoaded(true);
    }
  }

  const inStock = product.availableQuantity > 0n || product.madeToOrder;

  const displayPrice = customerType
    ? customerType === CustomerType.wholesale
      ? product.wholesalePrice
      : customerType === CustomerType.direct
      ? product.directPrice
      : product.retailPrice
    : product.retailPrice;

  // Owner controls are shown only when isOwner is true AND showOwnerControls is not explicitly false
  const canShowOwnerControls =
    isOwner && (showOwnerControls === undefined ? true : showOwnerControls);

  const getProductUrl = (ct: CustomerType) => {
    const base = window.location.origin + window.location.pathname;
    const ctStr =
      ct === CustomerType.wholesale
        ? "wholesale"
        : ct === CustomerType.direct
        ? "direct"
        : "retail";
    return `${base}#/public-product/${weaverId}/${product.id}/${ctStr}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} link copied!`);
    });
  };

  const shareOnWhatsApp = (url: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
  };

  const shareLinks = [
    { label: "Retail", type: CustomerType.retail },
    { label: "Wholesale", type: CustomerType.wholesale },
    { label: "Direct", type: CustomerType.direct },
  ];

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
        {/* Product image */}
        <div className="relative h-52 bg-muted flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-muted-foreground" />
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant={inStock ? "default" : "secondary"}
              className="text-xs"
            >
              {product.madeToOrder
                ? "Made to Order"
                : inStock
                ? "In Stock"
                : "Out of Stock"}
            </Badge>
          </div>
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-serif font-semibold text-foreground text-base mb-1 line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          <div className="mt-auto">
            {/* Owner view: show all three prices with distinct colors + available quantity */}
            {canShowOwnerControls ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="flex flex-col items-start bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2 py-1.5 border border-amber-200 dark:border-amber-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      Retail
                    </span>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300 leading-tight">
                      {formatPrice(product.retailPrice)}
                    </span>
                  </div>
                  <div className="flex flex-col items-start bg-teal-50 dark:bg-teal-950/30 rounded-lg px-2 py-1.5 border border-teal-200 dark:border-teal-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                      Wholesale
                    </span>
                    <span className="text-sm font-bold text-teal-700 dark:text-teal-300 leading-tight">
                      {formatPrice(product.wholesalePrice)}
                    </span>
                  </div>
                  <div className="flex flex-col items-start bg-rose-50 dark:bg-rose-950/30 rounded-lg px-2 py-1.5 border border-rose-200 dark:border-rose-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                      Direct
                    </span>
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-300 leading-tight">
                      {formatPrice(product.directPrice)}
                    </span>
                  </div>
                </div>

                {/* Available quantity */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Boxes className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Available:{" "}
                    <span
                      className={
                        product.availableQuantity === 0n && !product.madeToOrder
                          ? "text-destructive font-semibold"
                          : "text-foreground font-semibold"
                      }
                    >
                      {product.madeToOrder
                        ? "Made to Order"
                        : Number(product.availableQuantity)}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              /* Customer view: single price for their type */
              <p className="text-lg font-bold text-primary">
                {formatPrice(displayPrice)}
              </p>
            )}

            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {product.colors.slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Owner controls — hidden for public/customer views */}
            {canShowOwnerControls && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(product)}
                  className="flex-1 min-w-0"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStock?.(product.id)}
                  className="flex-1 min-w-0"
                >
                  {inStock ? (
                    <ToggleRight className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                  )}
                  {inStock ? "Mark OOS" : "In Stock"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete?.(product.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share dialog — only rendered for owner */}
      {canShowOwnerControls && (
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="bg-white dark:bg-card max-w-md">
            <DialogHeader>
              <DialogTitle>Share Product Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {shareLinks.map(({ label, type }) => {
                const url = getProductUrl(type);
                return (
                  <div
                    key={label}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <span className="text-sm font-medium text-foreground flex-1 min-w-0">
                      {label}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(url, label)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareOnWhatsApp(url)}
                      className="text-[#25D366] hover:text-[#1ebe5d] hover:bg-green-50 dark:hover:bg-green-950/30"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
