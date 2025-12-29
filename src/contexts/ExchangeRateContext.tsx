import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  useCurrencyRates,
  type CurrencyRate,
} from "@/services/api/currency-rates";
import { useUser } from "@/services/subgraph/queries";
import { transformUserToProfile } from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { isBankSupported, getCurrencyForCountry } from "@/constants/supported";

interface ExchangeRateContextValue {
  userCurrency: CurrencyRate | null;
  convertB3TRToCurrency: (b3trAmount: number) => string | null;
  formatCurrencyEquivalent: (b3trAmount: number) => string | null;
}

const ExchangeRateContext = createContext<ExchangeRateContextValue | undefined>(
  undefined
);

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const walletAddress = useWalletAddress();
  const { data: userData } = useUser(walletAddress);
  const { data: currencyRates = [] } = useCurrencyRates();

  const userProfile = useMemo(
    () =>
      userData
        ? transformUserToProfile(userData, walletAddress || undefined)
        : null,
    [userData, walletAddress]
  );

  // Get currency for user's country
  const userCurrency = useMemo(() => {
    const countryCode = userProfile?.country;

    if (!countryCode || !isBankSupported(countryCode)) {
      return null;
    }

    const currencyCode = getCurrencyForCountry(countryCode);
    if (!currencyCode) {
      return null;
    }

    const currency = currencyRates.find((c) => c.code === currencyCode);
    if (!currency?.rateToB3TR || currency.rateToB3TR <= 0) {
      return null;
    }

    return currency;
  }, [userProfile?.country, currencyRates]);

  // Convert B3TR to user's currency (memoized)
  const convertB3TRToCurrency = useCallback(
    (b3trAmount: number): string | null => {
      if (!userCurrency || !b3trAmount || b3trAmount <= 0) {
        return null;
      }

      const converted = b3trAmount * userCurrency.rateToB3TR;
      return `${userCurrency.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [userCurrency]
  );

  // Format currency equivalent for display (memoized)
  const formatCurrencyEquivalent = useCallback(
    (b3trAmount: number): string | null => {
      const converted = convertB3TRToCurrency(b3trAmount);
      return converted ? `≈ ${converted}` : null;
    },
    [convertB3TRToCurrency]
  );

  const value = useMemo(
    () => ({
      userCurrency,
      convertB3TRToCurrency,
      formatCurrencyEquivalent,
    }),
    [userCurrency, convertB3TRToCurrency, formatCurrencyEquivalent]
  );

  return (
    <ExchangeRateContext.Provider value={value}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExchangeRate() {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error(
      "useExchangeRate must be used within an ExchangeRateProvider"
    );
  }
  return context;
}
