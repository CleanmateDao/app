// Contract addresses - should be set via environment variables or deployment config
export const CONTRACT_ADDRESSES = {
  USER_REGISTRY: import.meta.env.VITE_USER_REGISTRY_ADDRESS || "",
  CLEANUP_FACTORY: import.meta.env.VITE_CLEANUP_FACTORY_ADDRESS || "",
  REWARDS_MANAGER: import.meta.env.VITE_REWARDS_MANAGER_ADDRESS || "",
  ADDRESSES_PROVIDER: import.meta.env.VITE_ADDRESSES_PROVIDER_ADDRESS || "",
  STREAK: import.meta.env.VITE_STREAK_ADDRESS || "",
} as const;

