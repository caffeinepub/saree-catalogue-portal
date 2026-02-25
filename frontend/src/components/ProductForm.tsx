import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Product, ProductForm as ProductFormType, ProductVisibility, ExternalBlob, Color } from '../backend';
import MultiImageUpload from './MultiImageUpload';

export interface ProductFormData {
  name: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  directPrice: number;
  availableQuantity: number;
  madeToOrder: boolean;
  visibility: ProductVisibility;
  images: ExternalBlob[];
  colors: Color[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<void>;
  editingProduct?: Product | null;
  isLoading?: boolean;
}

export default function ProductForm({ isOpen, onClose, onSubmit, editingProduct, isLoading = false }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [directPrice, setDirectPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('1');
  const [madeToOrder, setMadeToOrder] = useState(false);
  const [visibility, setVisibility] = useState<ProductVisibility>(ProductVisibility.all);
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setName(editingProduct.name);
        setDescription(editingProduct.description);
        setRetailPrice(editingProduct.retailPrice.toString());
        setWholesalePrice(editingProduct.wholesalePrice.toString());
        setDirectPrice(editingProduct.directPrice.toString());
        setAvailableQuantity(editingProduct.availableQuantity.toString());
        setMadeToOrder(editingProduct.madeToOrder);
        setVisibility(editingProduct.visibility as ProductVisibility);
        setImages(editingProduct.images);
        setColors(editingProduct.colors.map(c => ({ name: c.name, hex: c.hex })));
      } else {
        setName('');
        setDescription('');
        setRetailPrice('');
        setWholesalePrice('');
        setDirectPrice('');
        setAvailableQuantity('1');
        setMadeToOrder(false);
        setVisibility(ProductVisibility.all);
        setImages([]);
        setColors([]);
      }
      setColorName('');
      setColorHex('#000000');
    }
  }, [isOpen, editingProduct]);

  const handleAddColor = () => {
    if (!colorName.trim()) return;
    setColors([...colors, { name: colorName.trim(), hex: colorHex }]);
    setColorName('');
    setColorHex('#000000');
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      retailPrice: Math.round(parseFloat(retailPrice) || 0),
      wholesalePrice: Math.round(parseFloat(wholesalePrice) || 0),
      directPrice: Math.round(parseFloat(directPrice) || 0),
      availableQuantity: Math.round(parseFloat(availableQuantity) || 0),
      madeToOrder,
      visibility,
      images,
      colors,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Images */}
          <div className="flex flex-col gap-1.5">
            <Label>Product Images</Label>
            <MultiImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handwoven Silk Saree"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
              rows={3}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="retail-price">Retail Price (₹)</Label>
              <Input
                id="retail-price"
                type="number"
                min="0"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wholesale-price">Wholesale Price (₹)</Label>
              <Input
                id="wholesale-price"
                type="number"
                min="0"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direct-price">Direct Price (₹)</Label>
              <Input
                id="direct-price"
                type="number"
                min="0"
                value={directPrice}
                onChange={(e) => setDirectPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Quantity & Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Available Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as ProductVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-card">
                  <SelectItem value={ProductVisibility.all}>All Customers</SelectItem>
                  <SelectItem value={ProductVisibility.retailOnly}>Retail Only</SelectItem>
                  <SelectItem value={ProductVisibility.wholesaleOnly}>Wholesale Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Made to Order toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="made-to-order"
              checked={madeToOrder}
              onCheckedChange={setMadeToOrder}
            />
            <Label htmlFor="made-to-order">Made to Order</Label>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2">
            <Label>Colors</Label>
            <div className="flex gap-2">
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Color name"
                className="flex-1"
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Button type="button" variant="outline" onClick={handleAddColor} disabled={!colorName.trim()}>
                Add
              </Button>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                    <span
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(i)}
                      className="text-muted-foreground hover:text-destructive ml-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
