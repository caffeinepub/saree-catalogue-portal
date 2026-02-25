import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import ProductForm, { ProductFormData } from '../components/ProductForm';
import { useGetMyProducts, useAddProduct, useUpdateProduct, useRemoveProduct, useToggleOutOfStock } from '../hooks/useQueries';
import { ExternalBlob, Product, ProductVisibility } from '../backend';

export default function CatalogManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useGetMyProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const removeProduct = useRemoveProduct();
  const toggleOutOfStock = useToggleOutOfStock();

  const buildForm = (data: ProductFormData) => {
    const visibilityMap: Record<string, ProductVisibility> = {
      all: ProductVisibility.all,
      retailOnly: ProductVisibility.retailOnly,
      wholesaleOnly: ProductVisibility.wholesaleOnly,
    };

    // Ensure all images are proper ExternalBlob instances
    const images: ExternalBlob[] = data.images.map((img) => {
      if (img instanceof ExternalBlob) return img;
      // Fallback: treat as URL string
      return ExternalBlob.fromURL(img as unknown as string);
    });

    return {
      name: data.name,
      description: data.description,
      retailPrice: BigInt(Math.round(Number(data.retailPrice) * 100)),
      wholesalePrice: BigInt(Math.round(Number(data.wholesalePrice) * 100)),
      directPrice: BigInt(Math.round(Number(data.directPrice) * 100)),
      images,
      visibility: visibilityMap[data.visibility] ?? ProductVisibility.all,
      stockCount: BigInt(data.stockCount ?? 0),
      availableQuantity: BigInt(data.availableQuantity ?? 0),
      madeToOrder: data.madeToOrder ?? false,
      colors: data.colors ?? [],
    };
  };

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      const form = buildForm(data);
      await addProduct.mutateAsync(form);
      toast.success('Product added successfully!');
      setShowAddForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add product. Please try again.';
      toast.error(message);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    try {
      const form = buildForm(data);
      await updateProduct.mutateAsync({ id: editingProduct.id, form });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product. Please try again.';
      toast.error(message);
    }
  };

  const handleDeleteProduct = async (productId: bigint) => {
    try {
      await removeProduct.mutateAsync(productId);
      toast.success('Product removed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove product.';
      toast.error(message);
    }
  };

  const handleToggleStock = async (productId: bigint) => {
    try {
      await toggleOutOfStock.mutateAsync(productId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update stock status.';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">My Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage your products and inventory</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!products || products.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-40" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No products yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start building your catalog by adding your first product.
          </p>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id.toString()}
              product={product}
              isOwner={true}
              showOwnerControls={true}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => handleDeleteProduct(product.id)}
              onToggleStock={() => handleToggleStock(product.id)}
            />
          ))}
        </div>
      )}

      {/* Add Product Form Dialog */}
      <ProductForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSubmit={handleAddProduct}
        isSubmitting={addProduct.isPending}
        title="Add New Product"
      />

      {/* Edit Product Form Dialog */}
      {editingProduct && (
        <ProductForm
          open={!!editingProduct}
          onOpenChange={(open) => { if (!open) setEditingProduct(null); }}
          onSubmit={handleUpdateProduct}
          isSubmitting={updateProduct.isPending}
          title="Edit Product"
          initialData={editingProduct}
        />
      )}
    </div>
  );
}
