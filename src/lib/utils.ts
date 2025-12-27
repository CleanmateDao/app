import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toReadableB3tr(b3trAmount: number | bigint | string): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(formatEther(BigInt(b3trAmount))));
}

export function toB3tr(b3trAmount: string): number {
  return Number(formatEther(BigInt(b3trAmount)));
}

export function formatAddress(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

/**
 * Masks sensitive information in the format "aaa***bbb"
 * Shows first 3 characters and last 3 characters, with *** in between
 */
export function maskSensitiveInfo(value: string | null | undefined): string {
  if (!value || value.length === 0) return "N/A";
  
  // If value is 6 characters or less, just show first 3 and mask the rest
  if (value.length <= 6) {
    return value.slice(0, 3) + "***";
  }
  
  // Show first 3 and last 3 characters
  const start = value.slice(0, 3);
  const end = value.slice(-3);
  return `${start}***${end}`;
}
