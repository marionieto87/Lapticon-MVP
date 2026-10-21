import Link from "next/link";
import { LangToggle } from "./LangToggle";
import type { Dict, Lang } from "@/lib/i18n";

export function SiteHeader({ t, lang, signedIn, landing = false }: { t: Dict; lang: Lang; signedIn: boolean; landing?: boolean }) {
  return (
    <header>
      <div className="wrap bar">
        <Link className="logo" href="/"><i aria-hidden="true" />Lapticon</Link>
        {landing ? (
          <nav aria-label={t.nav_how}>
            <a href="#como">{t.nav_how}</a>
            <a href="#que">{t.nav_what}</a>
            <a href="#confianza">{t.nav_trust}</a>
          </nav>
        ) : (
          <span style={{ marginLeft: "auto" }} />
        )}
        <LangToggle lang={lang} />
        {signedIn ? (
          <Link className="btn btn-main btn-sm" href="/app">{t.nav_app}</Link>
        ) : (
          <>
            <Link className="btn btn-ghost btn-sm hide-sm" href="/login">{t.nav_login}</Link>
            <Link className="btn btn-main btn-sm" href="/registro">{t.nav_signup}</Link>
          </>
        )}
      </div>
    </header>
  );
}

export function SiteFooter({ t }: { t: Dict }) {
  return (
    <footer>
      <div className="wrap">
        <p><b>Lapticon</b> · {t.foot_route}</p>
        <p>{t.foot_legal}</p>
      </div>
    </footer>
  );
}
