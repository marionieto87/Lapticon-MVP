import Link from "next/link";
import { redirect } from "next/navigation";
import { LangToggle } from "@/components/LangToggle";
import { getDict } from "@/lib/lang";
import { requireUser } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang } = await getDict();
  const { user } = await requireUser();
  if (!user) redirect("/login");
  const name = String(user.user_metadata?.full_name ?? "").split(" ")[0];

  return (
    <>
      <header>
        <div className="wrap bar">
          <Link className="logo" href="/"><i aria-hidden="true" />Lapticon</Link>
          <span className="hint" style={{ marginLeft: "auto" }}>{t.hello}{name ? `, ${name}` : ""}</span>
          <LangToggle lang={lang} />
          <form action={signOut}><button className="btn btn-ghost btn-sm" type="submit">{t.logout}</button></form>
        </div>
      </header>
      <div className="container">
        <nav className="app-nav" aria-label="Lapticon">
          <Link href="/app">{t.app_explore}</Link>
          <Link href="/app/mis-encargos">{t.app_my_requests}</Link>
          <Link href="/app/viajes">{t.app_my_trips}</Link>
          <Link className="push btn btn-ghost btn-sm" href="/app/viajes/nuevo">{t.app_new_trip}</Link>
          <Link className="btn btn-main btn-sm" href="/app/encargos/nuevo">{t.app_new_request}</Link>
        </nav>
        {children}
      </div>
    </>
  );
}
