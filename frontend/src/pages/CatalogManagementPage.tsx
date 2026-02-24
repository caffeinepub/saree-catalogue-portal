import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import {
  useGetMyProducts,
  useAddProduct,
  useUpdateProduct,
  useRemoveProduct,
  useUpdateProductQuantity,
  useToggleStockStatus,
} from '../hooks/useQueries';
import { Product, ProductForm as ProductFormType } from '../backend';

export default function CatalogManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const { data: products = [], isLoading } = useGetMyProducts();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const removeProductMutation = useRemoveProduct();
  const updateQuantityMutation = useUpdateProductQuantity();
  const toggleStockMutation = useToggleStockStatus();

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: ProductFormType) => {
    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, form: formData });
      } else {
        await addProductMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await removeProductMutation.mutateAsync(id);
    }
  };

  const handleUpdateQuantity = async (id: bigint, newQuantity: bigint) => {
    await updateQuantityMutation.mutateAsync({ id, quantity: newQuantity });
  };

  const handleToggleStock = async (id: bigint, inStock: boolean) => {
    await toggleStockMutation.mutateAsync({ id, inStock });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catalog Management</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your catalog by adding your first product.
            </p>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id.toString()}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onUpdateQuantity={handleUpdateQuantity}
              onToggleStock={handleToggleStock}
            />
          ))}
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingProduct}
        isSubmitting={addProductMutation.isPending || updateProductMutation.isPending}
      />
    </div>
  );
}
