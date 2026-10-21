import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getDict } from "@/lib/lang";
import { signIn } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t, lang } = await getDict();
  const sp = await searchParams;
  return (
    <>
      <SiteHeader t={t} lang={lang} signedIn={false} />
      <main className="container auth">
        <form action={signIn} className="card narrow stack">
          <div>
            <h1 style={{ fontSize: "2rem" }}>{t.login_title}</h1>
            <p className="hint">{t.login_sub}</p>
          </div>
          {sp.check && <p className="success">{t.check_email}</p>}
          {sp.error && <p className="error">{t.err_login}</p>}
          <input type="hidden" name="next" value={sp.next ?? ""} />
          <label className="field" htmlFor="email">{t.f_email}
            <input id="email" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field" htmlFor="password">{t.f_password}
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="btn btn-main" type="submit">{t.login_btn}</button>
          <p className="hint">{t.no_account} <Link href="/registro">{t.nav_signup}</Link></p>
        </form>
      </main>
    </>
  );
}
