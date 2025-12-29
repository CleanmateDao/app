/**
 * Single source of truth for streak submission category options.
 */
export const STREAK_CATEGORIES = [
  "Waste",
  "Recycling",
  "Upcycling",
  "Tree Planting",
  "Conservation",
  "Eco Friendly",
] as const;

export type StreakCategory = (typeof STREAK_CATEGORIES)[number];

