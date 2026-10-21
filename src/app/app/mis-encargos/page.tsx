import { RequestCard } from "@/components/RequestCard";
import { getDict } from "@/lib/lang";
import { photoUrl, type Request } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export default async function MyRequests() {
  const { t, lang } = await getDict();
  const { supabase, user } = await requireUser();
  const [{ data: mine }, { data: carrying }] = await Promise.all([
    supabase.from("requests").select("*").eq("requester_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("requests").select("*").eq("traveler_id", user!.id).order("needed_by"),
  ]);

  const grid = (rows: Request[], empty: string) =>
    rows.length === 0 ? (
      <p className="empty">{empty}</p>
    ) : (
      <div className="cards">
        {rows.map((r) => (
          <RequestCard key={r.id} r={r} photo={photoUrl(supabase, r.photo_path)} t={t} lang={lang} showStatus />
        ))}
      </div>
    );

  return (
    <div className="page">
      <div className="page-head"><h1>{t.app_my_requests}</h1></div>
      {grid((mine ?? []) as Request[], t.my_requests_empty)}
      <div className="page-head"><h2 style={{ fontSize: "1.5rem" }}>{t.my_carrying}</h2></div>
      {grid((carrying ?? []) as Request[], t.my_carrying_empty)}
    </div>
  );
}
