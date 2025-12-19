import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  Download,
  Loader2,
  Coins,
  Building2,
} from "lucide-react";
import africanMasksPattern from "@/assets/african-masks-pattern.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from "@/constants/supported";
import { useBanks } from "@/services/api/banks";
import { useCurrencyRates } from "@/services/api/currency-rates";
import { useClaimRewardsWithPermit } from "@/services/api/bank-claim";
import { toast } from "sonner";
import { Wallet, Check } from "lucide-react";
import { useInfiniteTransactions, useUser } from "@/services/subgraph/queries";
import { useClaimRewards } from "@/services/contracts/mutations";
import { useDAppKitWallet } from "@vechain/vechain-kit";
import { ethers } from "ethers";
import {
  transformTransaction,
  transformUserToProfile,
} from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useCleanups } from "@/services/subgraph/queries";
import { transformCleanup } from "@/services/subgraph/transformers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PaymentMethod = "wallet" | "bank";

export default function Rewards() {
  const isMobile = useIsMobile();
  const walletAddress = useWalletAddress();

  // Fetch user data
  const { data: userData } = useUser(walletAddress);
  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );

  // Fetch cleanups to get cleanup metadata for rewards
  const { data: cleanupsData } = useCleanups({
    where: { published: true },
    first: 1000,
    userAddress: walletAddress || undefined,
  });
  const cleanupsMap = useMemo(() => {
    if (!cleanupsData) return new Map();
    const map = new Map();
    cleanupsData.forEach((c) => {
      const transformed = transformCleanup(c);
      map.set(c.id.toLowerCase(), transformed);
    });
    return map;
  }, [cleanupsData]);

  // Fetch transactions with infinite scroll
  const {
    data: infiniteTransactionsData,
    isLoading: isLoadingRewards,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(
    walletAddress
      ? {
          where: { user: walletAddress },
          orderBy: "timestamp",
          orderDirection: "desc",
        }
      : undefined,
    20,
    { enabled: !!walletAddress }
  );

  // Transform and flatten infinite query data
  const rewardTransactions = useMemo(() => {
    if (!infiniteTransactionsData) return [];
    // Handle infinite query format (with pages)
    type InfiniteData = { pages?: Array<Array<unknown>> };
    const infiniteData = infiniteTransactionsData as InfiniteData;
    if (infiniteData.pages) {
      return infiniteData.pages.flatMap((page) =>
        page.map((tx) => {
          const txData = tx as { cleanupId?: string | null };
          const cleanup = cleanupsMap.get(
            txData.cleanupId?.toLowerCase() || ""
          );
          return transformTransaction(
            tx as Parameters<typeof transformTransaction>[0],
            {
              title: cleanup?.title,
            }
          );
        })
      );
    }
    // Fallback for direct array format
    return (infiniteTransactionsData as Array<unknown>).map((tx) => {
      const txData = tx as { cleanupId?: string | null };
      const cleanup = cleanupsMap.get(txData.cleanupId?.toLowerCase() || "");
      return transformTransaction(
        tx as Parameters<typeof transformTransaction>[0],
        {
          title: cleanup?.title,
        }
      );
    });
  }, [infiniteTransactionsData, cleanupsMap]);

  // Infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
    fetchNextPage,
  });

  const [typeFilter, setTypeFilter] = useState<"all" | "earned" | "claimed">(
    "all"
  );
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  // For wallet payment, use connected wallet address
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  // For bank payment, fetch from API
  const { data: bankAccounts = [] } = useBanks(walletAddress);
  const { data: currencyRates = [] } = useCurrencyRates();

  // Use default bank or first bank
  const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0];
  const [selectedBankId, setSelectedBankId] = useState<string>(
    defaultBank?.id || ""
  );

  // Update selectedBankId when default bank changes
  useEffect(() => {
    if (defaultBank && selectedBankId !== defaultBank.id) {
      setSelectedBankId(defaultBank.id);
    }
  }, [defaultBank, selectedBankId]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    SUPPORTED_CURRENCIES[0].code
  );

  // Hooks for claiming
  const { account, requestTypedData } = useDAppKitWallet();
  const {
    sendTransaction: claimRewardsWallet,
    isTransactionPending: isClaimingWallet,
  } = useClaimRewards();
  const { mutate: claimRewardsBank, isPending: isClaimingBank } =
    useClaimRewardsWithPermit();

  // Use connected wallet address for wallet payment
  const selectedWallet = walletAddress
    ? {
        id: "connected",
        name: "Connected Wallet",
        address: walletAddress,
        type: "vechain" as const,
        isDefault: true,
      }
    : null;
  // For bank accounts, use API data
  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);
  const selectedCurrencyData = currencyRates.find(
    (c) => c.code === selectedCurrency
  ) ||
    currencyRates[0] || {
      code: SUPPORTED_CURRENCIES[0].code,
      name: SUPPORTED_CURRENCIES[0].name,
      symbol: SUPPORTED_CURRENCIES[0].symbol,
      rateToB3TR: 0,
    };

  // Update selectedCurrency when currencyRates load
  useEffect(() => {
    if (
      currencyRates.length > 0 &&
      !currencyRates.find((c) => c.code === selectedCurrency)
    ) {
      setSelectedCurrency(currencyRates[0].code);
    }
  }, [currencyRates, selectedCurrency]);

  const convertB3TRToCurrency = (b3trAmount: number): string => {
    const converted = b3trAmount * selectedCurrencyData.rateToB3TR;
    return `${selectedCurrencyData.symbol}${converted.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const maskAccountNumber = (accountNumber: string) => {
    return `****${accountNumber.slice(-4)}`;
  };

  const handleClaimRewards = async () => {
    if (!claimAmount || Number(claimAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userProfile || Number(claimAmount) > userProfile.pendingRewards) {
      toast.error("Amount exceeds available rewards");
      return;
    }

    if (paymentMethod === "wallet") {
      if (!walletAddress) {
        toast.error("Please connect your wallet");
        return;
      }

      setIsClaiming(true);
      try {
        await claimRewardsWallet({ amount: claimAmount });
        setClaimDialogOpen(false);
        setClaimAmount("");
      } catch (error) {
        console.error("Failed to claim rewards:", error);
      } finally {
        setIsClaiming(false);
      }
      return;
    }

    // Bank payment method - use permit signature
    const bankIdToUse = selectedBankId || defaultBank?.id;
    if (!bankIdToUse || !walletAddress || !account || !requestTypedData) {
      toast.error("Please connect your wallet and add a bank account");
      return;
    }

    if (!defaultBank) {
      toast.error("Please add a bank account in Settings");
      return;
    }

    setIsClaiming(true);
    try {
      // Get nonce from contract (need to create a provider for this)
      // For now, we'll use a simple approach - the backend can handle nonce retrieval
      // Set deadline (1 hour from now)
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Use VeChain Kit's requestTypedData for EIP-712 signing
      const domain = {
        name: "RewardsManager",
        version: "1",
        chainId: 100010, // VeChain testnet
        verifyingContract: import.meta.env.VITE_REWARDS_MANAGER_ADDRESS || "",
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      // We need to get the nonce - for now, use 0 and let backend handle it
      // In production, you'd fetch this from the contract
      const nonce = 0;

      const message = {
        owner: walletAddress,
        amount: claimAmount,
        deadline: deadline,
        nonce: nonce,
      };

      const signature = await requestTypedData(domain, types, message);

      // Parse signature (VeChain returns it in a specific format)
      // VeChain signatures are typically 65 bytes: r (32) + s (32) + v (1)
      const sigBytes = ethers.getBytes(signature);
      const r = ethers.hexlify(sigBytes.slice(0, 32));
      const s = ethers.hexlify(sigBytes.slice(32, 64));
      const v = sigBytes[64];

      const permit = {
        deadline,
        v,
        r,
        s,
      };

      // Call bank service to claim with permit
      claimRewardsBank(
        {
          userId: walletAddress, // Using wallet address as userId
          walletAddress,
          amount: claimAmount,
          bankId: bankIdToUse,
          permit,
        },
        {
          onSuccess: () => {
            setIsClaiming(false);
            setClaimDialogOpen(false);
            setClaimAmount("");
          },
          onError: (error) => {
            console.error("Failed to claim rewards:", error);
            setIsClaiming(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create permit signature:", error);
      toast.error(
        `Failed to create permit signature: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsClaiming(false);
    }
  };

  const filteredTransactions = rewardTransactions.filter((tx) => {
    if (typeFilter === "all") return true;
    return tx.type === typeFilter;
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Amount", "Cleanup", "Status", "TX Hash"];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type,
      tx.amount,
      tx.title,
      tx.status,
      tx.txHash || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewards.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rewards exported successfully");
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredTransactions, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewards.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rewards exported successfully");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-5xl mx-auto">
      {/* Header with Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${africanMasksPattern})` }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70 dark:from-background/98 dark:via-background/90 dark:to-background/80" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
            Rewards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Claim your B3TR tokens for participating in cleanups
          </p>
        </div>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="gradient-card relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full border-[3px] border-primary/10" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[3px] border-primary/15" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border-[3px] border-primary/20" />

          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Pending Rewards
              </span>
            </div>
            <p className="text-3xl font-semibold">
              {userProfile?.pendingRewards || 0}{" "}
              <span className="text-lg text-muted-foreground">B3TR</span>
            </p>
            {isMobile ? (
              <Drawer open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DrawerTrigger asChild>
                  <Button size="sm" className="gap-2 mt-4 w-full">
                    <Coins className="w-4 h-4" />
                    Claim Rewards
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Claim Rewards</DrawerTitle>
                    <DrawerDescription>
                      Choose how you want to receive your B3TR tokens.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("wallet")}
                          disabled={isClaiming}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === "wallet"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            Web3 Wallet
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("bank")}
                          disabled={isClaiming}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === "bank"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            Bank Account
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            Soon
                          </Badge>
                        </button>
                      </div>
                    </div>

                    {/* Wallet Selection */}
                    {paymentMethod === "wallet" && (
                      <div className="space-y-2">
                        <Label>Wallet Address *</Label>
                        {walletAddress ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  Connected Wallet
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              </div>
                              <p className="font-mono text-xs text-muted-foreground truncate">
                                {truncateAddress(walletAddress)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Please connect your wallet to claim rewards.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bank Account Selection */}
                    {paymentMethod === "bank" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Bank Account *</Label>
                          <RadioGroup
                            value={selectedBankId}
                            onValueChange={setSelectedBankId}
                            className="space-y-2"
                            disabled={isClaiming}
                          >
                            {bankAccounts.map((bank) => (
                              <label
                                key={bank.id}
                                htmlFor={`mobile-${bank.id}`}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedBankId === bank.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem
                                  value={bank.id}
                                  id={`mobile-${bank.id}`}
                                />
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {bank.bankName}
                                    </p>
                                    {bank.isDefault && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {bank.accountName} •{" "}
                                    {maskAccountNumber(bank.accountNumber)}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                          {bankAccounts.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No bank accounts configured. Add a bank account in
                              Settings.
                            </p>
                          )}
                        </div>

                        {/* Currency Selection */}
                        <div className="space-y-2">
                          <Label>Currency for Conversion</Label>
                          <Select
                            value={selectedCurrency}
                            onValueChange={setSelectedCurrency}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencyRates.map((currency) => (
                                <SelectItem
                                  key={currency.code}
                                  value={currency.code}
                                >
                                  {currency.symbol} {currency.name} (
                                  {currency.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Rate: 1 B3TR = {selectedCurrencyData.symbol}
                            {selectedCurrencyData.rateToB3TR.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="mobile-amount">Amount (B3TR) *</Label>
                      <Input
                        id="mobile-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        disabled={isClaiming}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Available: {userProfile?.pendingRewards || 0} B3TR
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-1"
                          onClick={() =>
                            setClaimAmount(
                              (userProfile?.pendingRewards || 0).toString()
                            )
                          }
                          disabled={isClaiming}
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    {claimAmount && Number(claimAmount) > 0 && (
                      <div className="p-3 bg-secondary rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">
                            {claimAmount} B3TR
                          </span>
                        </div>
                        {paymentMethod === "bank" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Converted Amount
                            </span>
                            <span className="font-medium text-primary">
                              {convertB3TRToCurrency(Number(claimAmount))}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">
                            {paymentMethod === "wallet"
                              ? "Web3 Wallet"
                              : "Bank Account"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Destination
                          </span>
                          <span className="text-xs truncate max-w-[150px]">
                            {paymentMethod === "wallet"
                              ? truncateAddress(walletAddress || "")
                              : `${selectedBank?.bankName} (${maskAccountNumber(
                                  selectedBank?.accountNumber || ""
                                )})`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DrawerFooter>
                    <Button
                      onClick={handleClaimRewards}
                      disabled={
                        isClaiming ||
                        isClaimingWallet ||
                        isClaimingBank ||
                        !claimAmount ||
                        (paymentMethod === "wallet"
                          ? !walletAddress
                          : !selectedBankId || !account)
                      }
                      className="w-full"
                    >
                      {isClaiming || isClaimingWallet || isClaimingBank ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        "Claim Tokens"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setClaimDialogOpen(false)}
                      disabled={isClaiming}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 mt-4 w-full">
                    <Coins className="w-4 h-4" />
                    Claim Rewards
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Claim Rewards</DialogTitle>
                    <DialogDescription>
                      Choose how you want to receive your B3TR tokens.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("wallet")}
                          disabled={isClaiming}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === "wallet"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            Web3 Wallet
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("bank")}
                          disabled={isClaiming}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            paymentMethod === "bank"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            Bank Account
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            Soon
                          </Badge>
                        </button>
                      </div>
                    </div>

                    {/* Wallet Selection */}
                    {paymentMethod === "wallet" && (
                      <div className="space-y-2">
                        <Label>Wallet Address *</Label>
                        {walletAddress ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  Connected Wallet
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              </div>
                              <p className="font-mono text-xs text-muted-foreground truncate">
                                {truncateAddress(walletAddress)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Please connect your wallet to claim rewards.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bank Account Selection */}
                    {paymentMethod === "bank" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Bank Account *</Label>
                          <RadioGroup
                            value={selectedBankId}
                            onValueChange={setSelectedBankId}
                            className="space-y-2"
                            disabled={isClaiming}
                          >
                            {bankAccounts.map((bank) => (
                              <label
                                key={bank.id}
                                htmlFor={bank.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedBankId === bank.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value={bank.id} id={bank.id} />
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {bank.bankName}
                                    </p>
                                    {bank.isDefault && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {bank.accountName} •{" "}
                                    {maskAccountNumber(bank.accountNumber)}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                          {bankAccounts.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No bank accounts configured. Add a bank account in
                              Settings.
                            </p>
                          )}
                        </div>

                        {/* Currency Selection */}
                        <div className="space-y-2">
                          <Label>Currency for Conversion</Label>
                          <Select
                            value={selectedCurrency}
                            onValueChange={setSelectedCurrency}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencyRates.map((currency) => (
                                <SelectItem
                                  key={currency.code}
                                  value={currency.code}
                                >
                                  {currency.symbol} {currency.name} (
                                  {currency.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Rate: 1 B3TR = {selectedCurrencyData.symbol}
                            {selectedCurrencyData.rateToB3TR.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (B3TR) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        disabled={isClaiming}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Available: {userProfile?.pendingRewards || 0} B3TR
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-1"
                          onClick={() =>
                            setClaimAmount(
                              (userProfile?.pendingRewards || 0).toString()
                            )
                          }
                          disabled={isClaiming}
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    {claimAmount && Number(claimAmount) > 0 && (
                      <div className="p-3 bg-secondary rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">
                            {claimAmount} B3TR
                          </span>
                        </div>
                        {paymentMethod === "bank" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Converted Amount
                            </span>
                            <span className="font-medium text-primary">
                              {convertB3TRToCurrency(Number(claimAmount))}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">
                            {paymentMethod === "wallet"
                              ? "Web3 Wallet"
                              : "Bank Account"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Destination
                          </span>
                          <span className="font-mono text-xs">
                            {paymentMethod === "wallet"
                              ? truncateAddress(walletAddress || "")
                              : `${selectedBank?.bankName} (${maskAccountNumber(
                                  selectedBank?.accountNumber || ""
                                )})`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setClaimDialogOpen(false)}
                      disabled={isClaiming}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleClaimRewards}
                      disabled={
                        isClaiming ||
                        isClaimingWallet ||
                        isClaimingBank ||
                        !claimAmount ||
                        (paymentMethod === "wallet"
                          ? !walletAddress
                          : !selectedBankId || !account)
                      }
                    >
                      {isClaiming || isClaimingWallet || isClaimingBank ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        "Claim Tokens"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full border-[3px] border-status-approved/10" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[3px] border-status-approved/15" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border-[3px] border-status-approved/20" />

          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-status-approved/10">
                <ArrowDownLeft className="w-5 h-5 text-status-approved" />
              </div>
              <span className="text-sm text-muted-foreground">
                Total Earned
              </span>
            </div>
            <p className="text-3xl font-semibold text-status-approved">
              {userProfile?.totalRewards || 0}{" "}
              <span className="text-lg text-muted-foreground">B3TR</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full border-[3px] border-accent/10" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[3px] border-accent/15" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border-[3px] border-accent/20" />

          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent/10">
                <ArrowUpRight className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">
                Total Claimed
              </span>
            </div>
            <p className="text-3xl font-semibold">
              {userProfile?.claimedRewards || 0}{" "}
              <span className="text-lg text-muted-foreground">B3TR</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <CardTitle className="text-base font-medium">
              Reward History
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "all" | "earned" | "claimed")
                }
              >
                <SelectTrigger className="w-28 sm:w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToJSON}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cleanup</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRewards ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Loading rewards...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{tx.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === "earned" ? (
                              <ArrowDownLeft className="w-4 h-4 text-status-approved" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-accent" />
                            )}
                            <span className="capitalize text-sm">
                              {tx.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm truncate max-w-[150px] block">
                            {tx.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              tx.type === "earned" ? "text-status-approved" : ""
                            }`}
                          >
                            {tx.type === "earned" ? "+" : "-"}
                            {tx.amount} B3TR
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!isLoadingRewards && filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <p className="text-muted-foreground">
                          No transactions found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Infinite Scroll Sentinel */}
            <div
              ref={sentinelRef}
              className="h-4 flex items-center justify-center py-4"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more transactions...</span>
                </div>
              )}
              {!hasNextPage && filteredTransactions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  No more transactions to load
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
