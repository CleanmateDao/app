/**
 * Supported countries for bank account registration
 */
export const SUPPORTED_COUNTRIES = [
  {
    code: "NG",
    name: "Nigeria",
  },
  {
    code: "OTHER",
    name: "Other",
  },
] as const;

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English",
  },
] as const;

/**
 * Supported fiat currencies for bank accounts
 */
export const SUPPORTED_CURRENCIES = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    countryCode: "NG",
  },
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRIES)[number]["code"];
export type SupportedLanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type SupportedCurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number]["code"];

/**
 * States/Provinces for supported countries
 * Organized by country code
 */
export const SUPPORTED_COUNTRY_STATES: Record<
  SupportedCountryCode,
  readonly { code: string; name: string }[]
> = {
  NG: [
    { code: "AB", name: "Abia" },
    { code: "AD", name: "Adamawa" },
    { code: "AK", name: "Akwa Ibom" },
    { code: "AN", name: "Anambra" },
    { code: "BA", name: "Bauchi" },
    { code: "BY", name: "Bayelsa" },
    { code: "BE", name: "Benue" },
    { code: "BO", name: "Borno" },
    { code: "CR", name: "Cross River" },
    { code: "DE", name: "Delta" },
    { code: "EB", name: "Ebonyi" },
    { code: "ED", name: "Edo" },
    { code: "EK", name: "Ekiti" },
    { code: "EN", name: "Enugu" },
    { code: "FC", name: "Federal Capital Territory" },
    { code: "GO", name: "Gombe" },
    { code: "IM", name: "Imo" },
    { code: "JI", name: "Jigawa" },
    { code: "KD", name: "Kaduna" },
    { code: "KN", name: "Kano" },
    { code: "KT", name: "Katsina" },
    { code: "KE", name: "Kebbi" },
    { code: "KO", name: "Kogi" },
    { code: "KW", name: "Kwara" },
    { code: "LA", name: "Lagos" },
    { code: "NA", name: "Nasarawa" },
    { code: "NI", name: "Niger" },
    { code: "OG", name: "Ogun" },
    { code: "ON", name: "Ondo" },
    { code: "OS", name: "Osun" },
    { code: "OY", name: "Oyo" },
    { code: "PL", name: "Plateau" },
    { code: "RI", name: "Rivers" },
    { code: "SO", name: "Sokoto" },
    { code: "TA", name: "Taraba" },
    { code: "YO", name: "Yobe" },
    { code: "ZA", name: "Zamfara" },
  ],
  OTHER: [],
} as const;

/**
 * Get states for a specific country
 */
export function getStatesForCountry(
  countryCode: SupportedCountryCode
): Array<{ code: string; name: string }> {
  return Array.from(SUPPORTED_COUNTRY_STATES[countryCode] || []);
}

export type SupportedStateCode =
  (typeof SUPPORTED_COUNTRY_STATES)[SupportedCountryCode][number]["code"];
