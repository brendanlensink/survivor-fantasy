"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSpoilerFreeMode, SPOILER_MODE_COOKIE } from "./spoilerMode";

export async function toggleSpoilerMode() {
  const next = isSpoilerFreeMode() ? "off" : "on";
  cookies().set(SPOILER_MODE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
