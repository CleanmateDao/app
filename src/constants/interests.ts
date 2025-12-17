/**
 * Single source of truth for organizer interest options.
 * Stored as strings because these are persisted in user metadata.
 */
export const INTEREST_OPTIONS = [
  "Beach Cleanup",
  "Urban Cleanup",
  "Nature Conservation",
  "Recycling",
  "Community Events",
  "Wildlife Protection",
  "Water Conservation",
  "Tree Planting",
  "Waste Management",
  "Education & Awareness",
] as const;

export type InterestOption = (typeof INTEREST_OPTIONS)[number];


