import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Product, ProductVisibility } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import MultiImageUpload from './MultiImageUpload';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    retailPrice: bigint;
    wholesalePrice: bigint;
    directPrice: bigint;
    images: ExternalBlob[];
    description: string;
    visibility: ProductVisibility;
    availableQuantity: bigint;
    madeToOrder: boolean;
    colors: Array<{ name: string; hex: string }>;
  }) => void;
  initialData?: Product;
  isSubmitting?: boolean;
}

const STANDARD_COLORS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Beige', hex: '#D4C5B9' },
  { name: 'Maroon', hex: '#7F1D1D' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Teal', hex: '#0F766E' },
];

export default function ProductForm({ isOpen, onClose, onSubmit, initialData, isSubmitting }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [retailPrice, setRetailPrice] = useState(initialData?.retailPrice.toString() || '');
  const [wholesalePrice, setWholesalePrice] = useState(initialData?.wholesalePrice.toString() || '');
  const [directPrice, setDirectPrice] = useState(initialData?.directPrice.toString() || '');
  const [images, setImages] = useState<ExternalBlob[]>(initialData?.images || []);
  const [description, setDescription] = useState(initialData?.description || '');
  const [visibility, setVisibility] = useState<ProductVisibility>(initialData?.visibility || ProductVisibility.all);
  const [availableQuantity, setAvailableQuantity] = useState(initialData?.availableQuantity.toString() || '0');
  const [madeToOrder, setMadeToOrder] = useState(initialData?.madeToOrder || false);
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; hex: string }>>(
    initialData?.colors || []
  );
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const retailPriceNum = BigInt(retailPrice || '0');
    const wholesalePriceNum = BigInt(wholesalePrice || '0');
    const directPriceNum = BigInt(directPrice || '0');
    const quantityNum = BigInt(availableQuantity || '0');

    if (retailPriceNum <= 0n || wholesalePriceNum <= 0n || directPriceNum <= 0n) {
      toast.error('All prices must be greater than 0');
      return;
    }

    onSubmit({
      name: name.trim(),
      retailPrice: retailPriceNum,
      wholesalePrice: wholesalePriceNum,
      directPrice: directPriceNum,
      images,
      description: description.trim(),
      visibility,
      availableQuantity: quantityNum,
      madeToOrder,
      colors: selectedColors,
    });
  };

  const handleColorToggle = (color: { name: string; hex: string }) => {
    const isSelected = selectedColors.some((c) => c.hex === color.hex);
    if (isSelected) {
      setSelectedColors(selectedColors.filter((c) => c.hex !== color.hex));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) {
      toast.error('Please enter a color name');
      return;
    }

    const newColor = { name: customColorName.trim(), hex: customColorHex };
    
    if (selectedColors.some((c) => c.hex === newColor.hex)) {
      toast.error('This color is already added');
      return;
    }

    setSelectedColors([...selectedColors, newColor]);
    setCustomColorName('');
    setCustomColorHex('#000000');
    toast.success('Custom color added');
  };

  const handleRemoveColor = (hex: string) => {
    setSelectedColors(selectedColors.filter((c) => c.hex !== hex));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images * (up to 5)</Label>
            <MultiImageUpload images={images} onChange={setImages} maxImages={5} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price (₹) *</Label>
              <Input
                id="retailPrice"
                type="number"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">Wholesale Price (₹) *</Label>
              <Input
                id="wholesalePrice"
                type="number"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directPrice">Direct Customer Price (₹) *</Label>
              <Input
                id="directPrice"
                type="number"
                value={directPrice}
                onChange={(e) => setDirectPrice(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as ProductVisibility)}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductVisibility.all}>All Customers</SelectItem>
                  <SelectItem value={ProductVisibility.retailOnly}>Retail Only</SelectItem>
                  <SelectItem value={ProductVisibility.wholesaleOnly}>Wholesale Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Available Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="madeToOrder" checked={madeToOrder} onCheckedChange={(checked) => setMadeToOrder(!!checked)} />
            <Label htmlFor="madeToOrder" className="cursor-pointer">
              Made to Order
            </Label>
          </div>

          <div className="space-y-3">
            <Label>Available Colors</Label>
            <div className="grid grid-cols-5 gap-2">
              {STANDARD_COLORS.map((color) => {
                const isSelected = selectedColors.some((c) => c.hex === color.hex);
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t pt-3 space-y-2">
              <Label>Add Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Color name"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-20"
                />
                <Button type="button" variant="outline" onClick={handleAddCustomColor}>
                  Add
                </Button>
              </div>
            </div>

            {selectedColors.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Colors:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <div
                      key={color.hex}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(color.hex)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
