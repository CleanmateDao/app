import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toReadableB3tr(b3trAmount: number): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(formatEther(BigInt(b3trAmount))));
}

export function toB3tr(b3trAmount: string): number {
  return Number(formatEther(BigInt(b3trAmount)));
}
