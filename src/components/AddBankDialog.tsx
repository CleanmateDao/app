import { useState, useEffect, useCallback, useRef } from "react";
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
import { usePreviewBankAccount, type Bank } from "@/services/api/banks";

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
  banks: Bank[];
  isLoadingBanks: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

export function AddBankDialog({
  open,
  onOpenChange,
  bankAccount,
  onBankAccountChange,
  banks,
  isLoadingBanks,
  onSubmit,
  isPending,
}: AddBankDialogProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewedAccountName, setPreviewedAccountName] = useState<string | null>(null);
  const previewMutation = usePreviewBankAccount();
  const previewTriggeredRef = useRef<string>(""); // Track what we've already previewed

  // Check if account number is exactly 10 digits
  const accountNumberDigits = bankAccount.accountNumber.replace(/\D/g, "");
  const canPreview = accountNumberDigits.length === 10 && bankAccount.bankCode && bankAccount.currency;
  
  // Create a unique key for the preview request
  const previewKey = `${accountNumberDigits}-${bankAccount.bankCode}-${bankAccount.currency}`;

  // Memoized preview handler
  const handlePreview = useCallback(async () => {
    if (!canPreview || previewKey === previewTriggeredRef.current) {
      return;
    }

    // Mark as triggered to prevent duplicate calls
    previewTriggeredRef.current = previewKey;
    setIsPreviewing(true);
    
    try {
      const result = await previewMutation.mutateAsync({
        accountNumber: accountNumberDigits,
        currency: bankAccount.currency,
        bankCode: bankAccount.bankCode,
      });
      
      setPreviewedAccountName(result.accountName);
      onBankAccountChange({
        ...bankAccount,
        accountName: result.accountName,
      });
    } catch (error) {
      // Error is already handled by the mutation
      setPreviewedAccountName(null);
      onBankAccountChange({
        ...bankAccount,
        accountName: "",
      });
      // Reset trigger on error so user can retry
      previewTriggeredRef.current = "";
    } finally {
      setIsPreviewing(false);
    }
  }, [canPreview, previewKey, accountNumberDigits, bankAccount, previewMutation, onBankAccountChange]);

  // Auto-preview when account number reaches 10 digits
  useEffect(() => {
    if (canPreview && !previewedAccountName && !isPreviewing && !previewMutation.isPending && previewKey !== previewTriggeredRef.current) {
      handlePreview();
    }
  }, [canPreview, previewedAccountName, isPreviewing, previewMutation.isPending, previewKey, handlePreview]);

  // Reset previewed name when account number or bank changes
  useEffect(() => {
    if (accountNumberDigits.length !== 10 || !bankAccount.bankCode) {
      setPreviewedAccountName(null);
      previewTriggeredRef.current = ""; // Reset trigger
      onBankAccountChange({
        ...bankAccount,
        accountName: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumberDigits, bankAccount.bankCode]);

  const handleAccountNumberChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "");
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10);
    
    onBankAccountChange({
      ...bankAccount,
      accountNumber: limited,
      // Clear account name if account number changes
      accountName: limited.length === 10 ? bankAccount.accountName : "",
    });

    // Reset preview if account number changes
    if (limited.length !== 10) {
      setPreviewedAccountName(null);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Dialog is closing, reset all state
      setPreviewedAccountName(null);
      previewTriggeredRef.current = "";
      setIsPreviewing(false);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset state when closing
          setPreviewedAccountName(null);
          previewTriggeredRef.current = "";
          onBankAccountChange({
            ...bankAccount,
            accountNumber: "",
            accountName: "",
          });
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:w-[90%] max-w-md">
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
                  accountName: "", // Clear account name when currency changes
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
            {isLoadingBanks ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading banks...
              </div>
            ) : (
              <Select
                value={bankAccount.bankCode}
                onValueChange={(value) => {
                  const selectedBank = banks.find(
                    (b) => b.code === value
                  );
                  if (selectedBank) {
                    onBankAccountChange({
                      ...bankAccount,
                      bankName: selectedBank.name,
                      bankCode: selectedBank.code,
                      accountName: "", // Clear account name when bank changes
                    });
                    setPreviewedAccountName(null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No banks available for this currency
                    </div>
                  ) : (
                    banks.map((bank) => (
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
              type="text"
              inputMode="numeric"
              placeholder="Enter 10-digit account number"
              value={bankAccount.accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              maxLength={10}
            />
            {accountNumberDigits.length > 0 && accountNumberDigits.length < 10 && (
              <p className="text-xs text-muted-foreground">
                {10 - accountNumberDigits.length} digit(s) remaining
              </p>
            )}
            {accountNumberDigits.length === 10 && !previewedAccountName && !isPreviewing && !previewMutation.isPending && previewTriggeredRef.current && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Verification failed. Please check the account number.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            {previewedAccountName ? (
              <div className="p-3 bg-secondary rounded-md border">
                <p className="text-sm font-medium">{previewedAccountName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Account name verified
                </p>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  {isPreviewing || previewMutation.isPending
                    ? "Verifying account name..."
                    : accountNumberDigits.length === 10 && previewTriggeredRef.current
                    ? "Unable to verify account name. Please check the account number and try again."
                    : accountNumberDigits.length === 10
                    ? "Verifying account..."
                    : "Enter 10-digit account number to verify"}
                </p>
              </div>
            )}
            {(isPreviewing || previewMutation.isPending) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying account...
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Reset all state when closing
              setPreviewedAccountName(null);
              previewTriggeredRef.current = "";
              onBankAccountChange({
                ...bankAccount,
                accountNumber: "",
                accountName: "",
              });
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="w-full sm:w-auto"
            disabled={isPending || !previewedAccountName || accountNumberDigits.length !== 10}
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

