import { useState } from 'react';
import { X } from 'lucide-react';
import { CustomerType } from '../backend';
import { useAddOrUpdateCustomer } from '../hooks/useQueries';
import type { Customer } from '../backend';

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerForm({ customer, onClose, onSuccess }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || '');
  const [customerType, setCustomerType] = useState<CustomerType>(
    customer?.customerType || CustomerType.retail
  );
  const [contactDetails, setContactDetails] = useState(customer?.contactDetails || '');

  const addOrUpdateCustomer = useAddOrUpdateCustomer();
  const isEditing = !!customer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addOrUpdateCustomer.mutateAsync({
        id: customer?.id || `customer-${Date.now()}`,
        name,
        customerType,
        contactDetails,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Customer Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="customerType" className="block text-sm font-medium text-foreground mb-2">
              Customer Type
            </label>
            <select
              id="customerType"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={CustomerType.retail}>Retail</option>
              <option value={CustomerType.wholesale}>Wholesale</option>
              <option value={CustomerType.direct}>Direct</option>
            </select>
          </div>

          <div>
            <label htmlFor="contactDetails" className="block text-sm font-medium text-foreground mb-2">
              Contact Details
            </label>
            <textarea
              id="contactDetails"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              placeholder="Phone, email, address..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-input bg-background text-foreground font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addOrUpdateCustomer.isPending}
              className="flex-1 bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addOrUpdateCustomer.isPending ? 'Saving...' : isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
