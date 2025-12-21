import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link2, Wallet } from "lucide-react";

interface ConnectWalletDialogProps {
  onConnect: () => void;
}

export function ConnectWalletDialog({ onConnect }: ConnectWalletDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Link2 className="w-4 h-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet provider to connect your Web3 wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="justify-start h-14"
            onClick={onConnect}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Wallet className="w-4 h-4" />
            </div>
            MetaMask
          </Button>
          <Button
            variant="outline"
            className="justify-start h-14"
            onClick={onConnect}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Wallet className="w-4 h-4" />
            </div>
            WalletConnect
          </Button>
          <Button
            variant="outline"
            className="justify-start h-14"
            onClick={onConnect}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Wallet className="w-4 h-4" />
            </div>
            Coinbase Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

