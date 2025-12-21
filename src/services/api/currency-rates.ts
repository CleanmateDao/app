import { useQuery } from "@tanstack/react-query";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from "@/constants/supported";
import { bankClient } from "../clients/bank";
import axios from "axios";

export interface CurrencyRate {
  code: SupportedCurrencyCode;
  name: string;
  symbol: string;
  rateToB3TR: number; // How many units of currency per 1 B3TR
  lastUpdated?: string;
}

export interface CurrencyRatesResponse {
  success: boolean;
  data?: CurrencyRate[];
  message?: string;
}

/**
 * Fetch currency rates from the API
 */
async function getCurrencyRates(): Promise<CurrencyRate[]> {
  try {
    const response = await bankClient.get<CurrencyRatesResponse>(
      `/currency-rates`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    // Fallback to default rates if API fails
    return SUPPORTED_CURRENCIES.map((currency) => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rateToB3TR: 0, // Will be set by API
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch currency rates:", error);
    }

    // Fallback to default rates
    return SUPPORTED_CURRENCIES.map((currency) => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rateToB3TR: 0, // Will be set by API
    }));
  }
}

/**
 * React hook for fetching currency rates
 */
export function useCurrencyRates() {
  return useQuery({
    queryKey: ["currency-rates"],
    queryFn: getCurrencyRates,
    staleTime: 1000 * 60 * 15, // 15 minutes (rates don't change frequently)
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
