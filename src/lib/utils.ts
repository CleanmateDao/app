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

/**
 * Sets a cookie with the given name, value, and expiration days
 */
export function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * Gets a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Checks if a cookie exists and is valid
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}
