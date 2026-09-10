import { cookies } from "next/headers";

export const SPOILER_MODE_COOKIE = "spoilerFree";

/** Spoiler-free mode defaults on — only an explicit "off" cookie disables it. */
export function isSpoilerFreeMode(): boolean {
  return cookies().get(SPOILER_MODE_COOKIE)?.value !== "off";
}
