import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getDict } from "@/lib/lang";
import { signUp } from "../login/actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { t, lang } = await getDict();
  const sp = await searchParams;
  return (
    <>
      <SiteHeader t={t} lang={lang} signedIn={false} />
      <main className="container auth">
        <form action={signUp} className="card narrow stack">
          <div>
            <h1 style={{ fontSize: "2rem" }}>{t.signup_title}</h1>
            <p className="hint">{t.signup_sub}</p>
          </div>
          {sp.error && <p className="error">{t.err_signup}</p>}
          <label className="field" htmlFor="full_name">{t.f_name}
            <input id="full_name" name="full_name" autoComplete="name" required />
          </label>
          <label className="field" htmlFor="email">{t.f_email}
            <input id="email" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field" htmlFor="password">{t.f_password}
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <small>{t.f_password_hint}</small>
          </label>
          <div className="grid-2">
            <label className="field" htmlFor="phone">{t.f_phone}
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+57 300 000 0000" required />
              <small>{t.f_phone_hint}</small>
            </label>
            <label className="field" htmlFor="city">{t.f_city}
              <select id="city" name="city" defaultValue="Montreal">
                <option value="Montreal">Montreal</option>
                <option value="Bogotá">Bogotá</option>
              </select>
            </label>
          </div>
          <label className="field" htmlFor="role">{t.f_role}
            <select id="role" name="role" defaultValue="both">
              <option value="send">{t.role_send}</option>
              <option value="travel">{t.role_travel}</option>
              <option value="both">{t.role_both}</option>
            </select>
          </label>
          <button className="btn btn-main" type="submit">{t.signup_btn}</button>
          <p className="hint">{t.have_account} <Link href="/login">{t.nav_login}</Link></p>
        </form>
      </main>
    </>
  );
}
