import React, { useState } from 'react';
import { Plus, Trash2, Edit, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CustomerForm, { CustomerFormData } from '../components/CustomerForm';
import { useGetAllCustomers, useAddOrUpdateCustomer, useRemoveCustomer } from '../hooks/useQueries';
import { Customer, CustomerType, CustomerForm as CustomerFormBackend } from '../backend';

const customerTypeBadgeClass = (type: CustomerType) => {
  switch (type) {
    case CustomerType.retail:
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    case CustomerType.wholesale:
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
    case CustomerType.direct:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
    default:
      return '';
  }
};

const customerTypeLabel = (type: CustomerType) => {
  switch (type) {
    case CustomerType.retail:
      return 'Retail';
    case CustomerType.wholesale:
      return 'Wholesale';
    case CustomerType.direct:
      return 'Direct';
    default:
      return type;
  }
};

function toBackendCustomerForm(data: CustomerFormData): CustomerFormBackend {
  return {
    name: data.name,
    businessName: data.businessName.trim() || undefined,
    contactNumber: data.contactNumber,
    addressLine1: data.addressLine1.trim() || undefined,
    city: data.city.trim() || undefined,
    state: data.state.trim() || undefined,
    postalCode: data.postalCode.trim() || undefined,
    customerType: data.customerType,
  };
}

export default function CustomerManagementPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useGetAllCustomers();
  const addOrUpdateCustomer = useAddOrUpdateCustomer();
  const removeCustomer = useRemoveCustomer();

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CustomerFormData) => {
    const id = editingCustomer ? editingCustomer.id : `customer_${Date.now()}`;
    addOrUpdateCustomer.mutate(
      { id, customerForm: toBackendCustomerForm(data) },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingCustomer(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingCustomer) return;
    removeCustomer.mutate(deletingCustomer.id, {
      onSuccess: () => {
        setDeletingCustomer(null);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage your customer directory</p>
          </div>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No customers yet</p>
          <p className="text-sm mt-1">Add your first customer to get started.</p>
          <Button onClick={handleAddNew} className="mt-4">
            <Plus size={16} className="mr-2" />
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Customer Type</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.businessName || <span className="italic text-muted-foreground/60">—</span>}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${customerTypeBadgeClass(customer.customerType)}`}
                    >
                      {customerTypeLabel(customer.customerType)}
                    </span>
                  </TableCell>
                  <TableCell>{customer.contactNumber}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingCustomer(customer)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingCustomer={editingCustomer}
        isLoading={addOrUpdateCustomer.isPending}
      />

      <AlertDialog open={!!deletingCustomer} onOpenChange={(o) => !o && setDeletingCustomer(null)}>
        <AlertDialogContent className="bg-white dark:bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deletingCustomer?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeCustomer.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
