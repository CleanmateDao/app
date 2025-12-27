/**
 * Device detection utilities for streak submission
 */

/**
 * Detects the device type from the user agent
 * @returns "ios" | "android" | "desktop"
 */
export function getDeviceType(): "ios" | "android" | "desktop" {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for iOS devices
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }

  // Check for Android devices
  if (/android/.test(userAgent)) {
    return "android";
  }

  // Default to desktop
  return "desktop";
}

