import { db } from "@/db";
import { settings } from "@/db/schema";

export type Branding = {
  clubLogo: string;
  schoolLogo: string;
  clubName: string;
  schoolName: string;
};

export const BRANDING_KEYS = ["club_logo", "school_logo", "club_name", "school_name"] as const;

const FALLBACK: Branding = {
  clubLogo: "",
  schoolLogo: "",
  clubName: "বিউএসএস সাইেন্স ক্লাব",
  schoolName: "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ",
};

/** Reads branding settings (logos + names) from the settings key/value table */
export async function getBranding(): Promise<Branding> {
  try {
    const rows = await db.select().from(settings);
    const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));
    return {
      clubLogo: map.get("club_logo") || FALLBACK.clubLogo,
      schoolLogo: map.get("school_logo") || FALLBACK.schoolLogo,
      clubName: map.get("club_name") || FALLBACK.clubName,
      schoolName: map.get("school_name") || FALLBACK.schoolName,
    };
  } catch {
    return FALLBACK;
  }
}
