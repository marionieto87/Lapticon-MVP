import Link from "next/link";
import { formatDate } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import type { Trip } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export default async function MyTrips() {
  const { t, lang } = await getDict();
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("trips").select("*").eq("traveler_id", user!.id).order("flight_date", { ascending: false });
  const trips = (data ?? []) as Trip[];

  return (
    <div className="page">
      <div className="page-head">
        <h1>{t.app_my_trips}</h1>
        <Link className="btn btn-main" href="/app/viajes/nuevo">{t.app_new_trip}</Link>
      </div>
      {trips.length === 0 ? (
        <p className="empty">{t.my_trips_empty}</p>
      ) : (
        <div className="list">
          {trips.map((tr) => (
            <div className="list-item" key={tr.id}>
              <div className="stack" style={{ gap: 2 }}>
                <b className="meta" style={{ color: "var(--ink)", fontSize: "1rem" }}>{tr.origin} → {tr.destination} · {formatDate(tr.flight_date, lang)}</b>
                {tr.notes && <span className="hint">{tr.notes}</span>}
              </div>
              <span className="offer">{Number(tr.space_kg).toLocaleString(lang)} {t.kg_free}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
