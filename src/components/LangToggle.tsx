import { setLang } from "@/app/actions";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang }: { lang: Lang }) {
  return (
    <form action={setLang} className="lang" role="group" aria-label="Idioma / Language">
      <button type="submit" name="lang" value="es" aria-pressed={lang === "es"}>ES</button>
      <button type="submit" name="lang" value="en" aria-pressed={lang === "en"}>EN</button>
    </form>
  );
}
