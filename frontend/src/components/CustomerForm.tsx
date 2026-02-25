import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, CustomerType } from '../backend';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerFormData) => void;
  editingCustomer?: Customer | null;
  isLoading?: boolean;
}

export interface CustomerFormData {
  name: string;
  businessName: string;
  contactNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  customerType: CustomerType;
}

const defaultFormData: CustomerFormData = {
  name: '',
  businessName: '',
  contactNumber: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  customerType: CustomerType.retail,
};

export default function CustomerForm({
  open,
  onOpenChange,
  onSubmit,
  editingCustomer,
  isLoading = false,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        businessName: editingCustomer.businessName || '',
        contactNumber: editingCustomer.contactNumber || '',
        addressLine1: editingCustomer.addressLine1 || '',
        city: editingCustomer.city || '',
        state: editingCustomer.state || '',
        postalCode: editingCustomer.postalCode || '',
        customerType: editingCustomer.customerType,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [editingCustomer, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required.';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required.';
    } else if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = 'Contact number must be exactly 10 numeric digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-1">
            <Label htmlFor="name">
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter customer name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-1">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="Enter business name (optional)"
              disabled={isLoading}
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-1">
            <Label htmlFor="contactNumber">
              Contact Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              maxLength={10}
              disabled={isLoading}
            />
            {errors.contactNumber && (
              <p className="text-xs text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          {/* Customer Type */}
          <div className="space-y-1">
            <Label htmlFor="customerType">Customer Type</Label>
            <Select
              value={formData.customerType}
              onValueChange={(val) => handleChange('customerType', val as CustomerType)}
              disabled={isLoading}
            >
              <SelectTrigger id="customerType" className="bg-white dark:bg-card">
                <SelectValue placeholder="Select customer type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-card">
                <SelectItem value={CustomerType.retail}>Retail</SelectItem>
                <SelectItem value={CustomerType.wholesale}>Wholesale</SelectItem>
                <SelectItem value={CustomerType.direct}>Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-1">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              placeholder="Street address (optional)"
              disabled={isLoading}
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-1">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="Postal code (optional)"
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
