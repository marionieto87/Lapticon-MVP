import { cookies } from "next/headers";
import { dicts, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "en" ? "en" : "es";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dicts[lang] };
}
