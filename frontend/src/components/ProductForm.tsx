import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import MultiImageUpload from './MultiImageUpload';
import { Product, ExternalBlob, Color } from '../backend';

export interface ProductFormData {
  name: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  directPrice: number;
  images: ExternalBlob[];
  visibility: string;
  stockCount: number;
  availableQuantity: number;
  madeToOrder: boolean;
  colors: Color[];
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
  title?: string;
  initialData?: Product | null;
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  retailPrice: 0,
  wholesalePrice: 0,
  directPrice: 0,
  images: [],
  visibility: 'all',
  stockCount: 0,
  availableQuantity: 0,
  madeToOrder: false,
  colors: [],
};

export default function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  title = 'Product',
  initialData,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // Populate form when editing
  useEffect(() => {
    if (open && initialData) {
      const visibilityStr = (() => {
        const v = initialData.visibility as unknown as { all?: null; retailOnly?: null; wholesaleOnly?: null } | string;
        if (typeof v === 'object') {
          if ('all' in v) return 'all';
          if ('retailOnly' in v) return 'retailOnly';
          if ('wholesaleOnly' in v) return 'wholesaleOnly';
        }
        return String(v);
      })();

      setFormData({
        name: initialData.name,
        description: initialData.description,
        retailPrice: Number(initialData.retailPrice) / 100,
        wholesalePrice: Number(initialData.wholesalePrice) / 100,
        directPrice: Number(initialData.directPrice) / 100,
        images: initialData.images as ExternalBlob[],
        visibility: visibilityStr,
        stockCount: Number(initialData.stockCount),
        availableQuantity: Number(initialData.availableQuantity),
        madeToOrder: initialData.madeToOrder,
        colors: initialData.colors,
      });
    } else if (open && !initialData) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required.';
    if (formData.retailPrice < 0) newErrors.retailPrice = 'Retail price must be 0 or more.';
    if (formData.wholesalePrice < 0) newErrors.wholesalePrice = 'Wholesale price must be 0 or more.';
    if (formData.directPrice < 0) newErrors.directPrice = 'Direct price must be 0 or more.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Handwoven Silk Saree"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe your product..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="retailPrice">Retail Price (₹)</Label>
              <Input
                id="retailPrice"
                type="number"
                min={0}
                step={0.01}
                value={formData.retailPrice}
                onChange={(e) => setFormData((p) => ({ ...p, retailPrice: parseFloat(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
              {errors.retailPrice && <p className="text-xs text-destructive">{errors.retailPrice}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="wholesalePrice">Wholesale Price (₹)</Label>
              <Input
                id="wholesalePrice"
                type="number"
                min={0}
                step={0.01}
                value={formData.wholesalePrice}
                onChange={(e) => setFormData((p) => ({ ...p, wholesalePrice: parseFloat(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
              {errors.wholesalePrice && <p className="text-xs text-destructive">{errors.wholesalePrice}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="directPrice">Direct Price (₹)</Label>
              <Input
                id="directPrice"
                type="number"
                min={0}
                step={0.01}
                value={formData.directPrice}
                onChange={(e) => setFormData((p) => ({ ...p, directPrice: parseFloat(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
              {errors.directPrice && <p className="text-xs text-destructive">{errors.directPrice}</p>}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-1">
            <Label>Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(v) => setFormData((p) => ({ ...p, visibility: v }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="retailOnly">Retail Only</SelectItem>
                <SelectItem value="wholesaleOnly">Wholesale Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="stockCount">Stock Count</Label>
              <Input
                id="stockCount"
                type="number"
                min={0}
                value={formData.stockCount}
                onChange={(e) => setFormData((p) => ({ ...p, stockCount: parseInt(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="availableQuantity">Available Quantity</Label>
              <Input
                id="availableQuantity"
                type="number"
                min={0}
                value={formData.availableQuantity}
                onChange={(e) => setFormData((p) => ({ ...p, availableQuantity: parseInt(e.target.value) || 0 }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Made to Order */}
          <div className="flex items-center gap-3">
            <Switch
              id="madeToOrder"
              checked={formData.madeToOrder}
              onCheckedChange={(checked) => setFormData((p) => ({ ...p, madeToOrder: checked }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="madeToOrder">Made to Order</Label>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors.map((color, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-border bg-muted"
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(i)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-9 h-9 rounded border border-border cursor-pointer"
                disabled={isSubmitting}
              />
              <Input
                placeholder="Color name"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColor}
                disabled={isSubmitting || !newColorName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-1">
            <Label>Product Images</Label>
            <MultiImageUpload
              images={formData.images}
              onChange={(images) => setFormData((p) => ({ ...p, images }))}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
