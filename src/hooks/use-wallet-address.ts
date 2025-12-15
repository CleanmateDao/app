import { useWallet } from "@vechain/dapp-kit-react";

export function useWalletAddress(): string | null {
  const { account } = useWallet();
  return account || null;
}
