import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Store, Handshake } from 'lucide-react';

interface CustomerTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customerType: string) => void;
  title?: string;
  description?: string;
}

const customerTypes = [
  {
    value: 'retail',
    label: 'Retail',
    description: 'Individual buyers at retail prices',
    icon: Store,
  },
  {
    value: 'wholesale',
    label: 'Wholesale',
    description: 'Bulk buyers at wholesale prices',
    icon: Users,
  },
  {
    value: 'direct',
    label: 'Direct',
    description: 'Direct customers at special prices',
    icon: Handshake,
  },
];

export default function CustomerTypeDialog({
  open,
  onOpenChange,
  onSelect,
  title = 'Select Customer Type',
  description = 'Choose the customer type for this link',
}: CustomerTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          {customerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 bg-white dark:bg-card hover:bg-muted"
                onClick={() => onSelect(type.value)}
              >
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
