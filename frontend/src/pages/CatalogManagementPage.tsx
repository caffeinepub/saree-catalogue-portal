import { useState } from "react";
import {
  useGetMyProducts,
  useAddProduct,
  useUpdateProduct,
  useRemoveProduct,
  useToggleOutOfStock,
} from "../hooks/useQueries";
import { Product, ProductForm, CustomerType, ExternalBlob } from "../backend";
import ProductCard from "../components/ProductCard";
import ProductFormComponent from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ProductFormData } from "../components/ProductForm";

export default function CatalogManagementPage() {
  const { identity } = useInternetIdentity();
  const weaverId = identity?.getPrincipal().toString() ?? "";

  const { data: products = [], isLoading } = useGetMyProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const removeProduct = useRemoveProduct();
  const toggleStock = useToggleOutOfStock();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId: bigint) => {
    try {
      await removeProduct.mutateAsync(productId);
      toast.success("Product removed.");
    } catch {
      toast.error("Failed to remove product.");
    }
  };

  const handleToggleStock = async (productId: bigint) => {
    try {
      await toggleStock.mutateAsync(productId);
      toast.success("Stock status updated.");
    } catch {
      toast.error("Failed to update stock status.");
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const images = data.images.map((img) => {
        if (img instanceof ExternalBlob) return img;
        return ExternalBlob.fromURL(img as string);
      });

      const form: ProductForm = {
        name: data.name,
        retailPrice: BigInt(data.retailPrice),
        wholesalePrice: BigInt(data.wholesalePrice),
        directPrice: BigInt(data.directPrice),
        images,
        description: data.description,
        visibility: data.visibility,
        availableQuantity: BigInt(data.availableQuantity),
        madeToOrder: data.madeToOrder,
        colors: data.colors,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, form });
        toast.success("Product updated.");
      } else {
        await addProduct.mutateAsync(form);
        toast.success("Product added.");
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch {
      toast.error("Failed to save product.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with Add Product button — visible only to authenticated weavers */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            My Catalog
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your products and pricing
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-border"
            >
              <Skeleton className="h-52 w-full" />
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
          <p className="text-muted-foreground text-lg mb-4">
            No products yet. Add your first product!
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id.toString()}
              product={product}
              customerType={CustomerType.retail}
              weaverId={weaverId}
              isOwner={true}
              showOwnerControls={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStock={handleToggleStock}
            />
          ))}
        </div>
      )}

      {/* Product form dialog */}
      <ProductFormComponent
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        isLoading={addProduct.isPending || updateProduct.isPending}
      />
    </div>
  );
}
