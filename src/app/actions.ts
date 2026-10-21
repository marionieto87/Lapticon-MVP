"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLang(formData: FormData) {
  const lang = formData.get("lang") === "en" ? "en" : "es";
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
