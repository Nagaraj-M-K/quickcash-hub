import Cookies from "js-cookie";
import { supabase } from "@/integrations/supabase/client";

const ANONYMOUS_ID_COOKIE = "ref_anon_id";
const COOKIE_EXPIRY_DAYS = 30;

export const getAnonymousId = (): string => {
  let anonId = Cookies.get(ANONYMOUS_ID_COOKIE);
  
  if (!anonId) {
    anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    Cookies.set(ANONYMOUS_ID_COOKIE, anonId, { expires: COOKIE_EXPIRY_DAYS });
  }
  
  return anonId;
};

export const trackClick = async (
  appId: string,
  userId: string | null,
  utmParams: Record<string, string> = {},
  isMyReferral: boolean = false
) => {
  try {
    const anonymousId = userId ? null : getAnonymousId();
    
    const { error } = await supabase.from("clicks").insert({
      app_id: appId,
      user_id: userId,
      anonymous_id: anonymousId,
      utm_source: utmParams.utm_source || "organic",
      utm_medium: utmParams.utm_medium || "web",
      utm_campaign: utmParams.utm_campaign || "referral",
      is_my_referral: isMyReferral,
    });

    if (error) {
      console.error("Error tracking click:", error);
    }

    // Track with Google Analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "referral_click", {
        app_id: appId,
        user_id: userId || anonymousId,
        ...utmParams,
      });
    }
  } catch (error) {
    console.error("Error in trackClick:", error);
  }
};

export const getUtmParams = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };
};
