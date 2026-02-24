import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Building2, UserCheck } from 'lucide-react';

interface CustomerTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomerType: (customerType: 'retail' | 'wholesale' | 'direct') => void;
}

export default function CustomerTypeDialog({
  open,
  onOpenChange,
  onSelectCustomerType,
}: CustomerTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Select Customer Type</DialogTitle>
          <DialogDescription>
            Choose the customer type for the shareable link. The link will display pricing specific to the selected customer type.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex items-start gap-3 hover:bg-primary/5 hover:border-primary"
            onClick={() => {
              onSelectCustomerType('retail');
              onOpenChange(false);
            }}
          >
            <Users className="w-5 h-5 mt-0.5 text-primary" />
            <div className="text-left flex-1">
              <div className="font-semibold">Retail Customer</div>
              <div className="text-xs text-muted-foreground">Individual buyers and end consumers</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex items-start gap-3 hover:bg-primary/5 hover:border-primary"
            onClick={() => {
              onSelectCustomerType('wholesale');
              onOpenChange(false);
            }}
          >
            <Building2 className="w-5 h-5 mt-0.5 text-primary" />
            <div className="text-left flex-1">
              <div className="font-semibold">Wholesale Customer</div>
              <div className="text-xs text-muted-foreground">Bulk buyers and resellers</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex items-start gap-3 hover:bg-primary/5 hover:border-primary"
            onClick={() => {
              onSelectCustomerType('direct');
              onOpenChange(false);
            }}
          >
            <UserCheck className="w-5 h-5 mt-0.5 text-primary" />
            <div className="text-left flex-1">
              <div className="font-semibold">Direct Customer</div>
              <div className="text-xs text-muted-foreground">Special pricing for direct relationships</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
