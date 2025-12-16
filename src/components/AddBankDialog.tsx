import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { SUPPORTED_CURRENCIES, type SupportedCurrencyCode } from "@/constants/supported";
import type { PaystackBank } from "@/services/api/banks";

interface AddBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccount: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    currency: SupportedCurrencyCode;
  };
  onBankAccountChange: (account: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    currency: SupportedCurrencyCode;
  }) => void;
  paystackBanks: PaystackBank[];
  isLoadingPaystackBanks: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

export function AddBankDialog({
  open,
  onOpenChange,
  bankAccount,
  onBankAccountChange,
  paystackBanks,
  isLoadingPaystackBanks,
  onSubmit,
  isPending,
}: AddBankDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>
            Add a new bank account to receive payments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={bankAccount.currency}
              onValueChange={(v) =>
                onBankAccountChange({
                  ...bankAccount,
                  currency: v as SupportedCurrencyCode,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            {isLoadingPaystackBanks ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading banks...
              </div>
            ) : (
              <Select
                value={bankAccount.bankCode}
                onValueChange={(value) => {
                  const selectedBank = paystackBanks.find(
                    (b) => b.code === value
                  );
                  if (selectedBank) {
                    onBankAccountChange({
                      ...bankAccount,
                      bankName: selectedBank.name,
                      bankCode: selectedBank.code,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {paystackBanks.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No banks available for this currency
                    </div>
                  ) : (
                    paystackBanks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              placeholder="Enter account number"
              value={bankAccount.accountNumber}
              onChange={(e) =>
                onBankAccountChange({
                  ...bankAccount,
                  accountNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input
              placeholder="Enter account holder name"
              value={bankAccount.accountName}
              onChange={(e) =>
                onBankAccountChange({
                  ...bankAccount,
                  accountName: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

