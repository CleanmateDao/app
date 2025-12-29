import { useEffect } from "react";
import { setCookie, hasCookie } from "@/lib/utils";

const POPUP_COOKIE_NAME = "popup_shown";
const POPUP_COOKIE_DAYS = 7;

export const PopupHandler = () => {
  useEffect(() => {
    // Check if popup was already shown within the last 7 days
    if (hasCookie(POPUP_COOKIE_NAME)) return;

    const popup = window.open("about:blank");

    if (!popup) {
      console.warn("Popup blocked");
      return;
    }

    popup.close();

    // Set cookie for 7 days when popup is shown
    setCookie(POPUP_COOKIE_NAME, "true", POPUP_COOKIE_DAYS);
  }, []);

  return null;
};
