import { useWallet } from "@vechain/vechain-kit";

export function useWalletAddress(): string | null {
  const { account } = useWallet();
  return account?.address || null;
}
