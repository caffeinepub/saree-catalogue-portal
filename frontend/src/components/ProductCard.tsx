import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Share2, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { Product } from '../backend';
import { toast } from 'sonner';
import CustomerTypeDialog from './CustomerTypeDialog';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: bigint) => void;
  onUpdateQuantity: (id: bigint, newQuantity: bigint) => void;
  onToggleStock: (id: bigint, inStock: boolean) => void;
}

export default function ProductCard({ product, onEdit, onDelete, onUpdateQuantity, onToggleStock }: ProductCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const inStock = product.availableQuantity > 0n;

  const handleSelectCustomerType = (customerType: 'retail' | 'wholesale' | 'direct') => {
    const shareUrl = `${window.location.origin}/public/${product.owner.toString()}/${customerType}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Catalog link copied to clipboard!');
  };

  const handleIncrement = () => {
    const newQuantity = product.availableQuantity + 1n;
    onUpdateQuantity(product.id, newQuantity);
  };

  const handleDecrement = () => {
    if (product.availableQuantity > 0n) {
      const newQuantity = product.availableQuantity - 1n;
      onUpdateQuantity(product.id, newQuantity);
    }
  };

  const handleStockToggle = (checked: boolean) => {
    onToggleStock(product.id, checked);
  };

  // Get the first image or show placeholder
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {displayImage ? (
            <img
              src={displayImage.getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {product.madeToOrder && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              Made to Order
            </Badge>
          )}
          {product.images && product.images.length > 1 && (
            <Badge className="absolute top-2 left-2 bg-black/70 text-white">
              {product.images.length} photos
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {product.id.toString()}</p>
            </div>
            <Badge variant={inStock ? 'default' : 'destructive'}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retail:</span>
              <span className="font-medium">₹{product.retailPrice.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wholesale:</span>
              <span className="font-medium">₹{product.wholesalePrice.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direct:</span>
              <span className="font-medium">₹{product.directPrice.toString()}</span>
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

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={handleDecrement}
                  disabled={product.availableQuantity === 0n}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium min-w-[2rem] text-center">
                  {product.availableQuantity.toString()}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={handleIncrement}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`stock-${product.id}`}
                checked={inStock}
                onCheckedChange={handleStockToggle}
              />
              <label htmlFor={`stock-${product.id}`} className="text-sm cursor-pointer">
                In Stock
              </label>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Visibility:{' '}
            {product.visibility === 'all'
              ? 'All Customers'
              : product.visibility === 'retailOnly'
              ? 'Retail Only'
              : 'Wholesale Only'}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(product)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      <CustomerTypeDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onSelectCustomerType={handleSelectCustomerType}
      />
    </>
  );
}
