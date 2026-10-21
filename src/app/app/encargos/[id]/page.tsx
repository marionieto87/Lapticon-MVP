import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge, Stars, StatusBadge } from "@/components/Badges";
import { formatDate, formatMoney, type Dict } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { photoUrl, statsFor, today, type Request, type Stats, type Trip } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";
import { advance, rate } from "../actions";

function Person({ label, stats, t }: { label: string; stats?: Stats; t: Dict }) {
  if (!stats) return null;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <span className="eyebrow">{label}</span>
      <div className="person">
        <b>{stats.full_name}</b>
        <LevelBadge stats={stats} t={t} />
        <Stars stats={stats} t={t} />
      </div>
      <span className="hint">
        {stats.requests_delivered} {t.requests_done} · {stats.trips_delivered} {t.trips_done}
      </span>
    </div>
  );
}

function Step({ id, next, label, ghost = false }: { id: string; next: string; label: string; ghost?: boolean }) {
  return (
    <form action={advance}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next" value={next} />
      <button className={`btn ${ghost ? "btn-ghost" : "btn-main"}`} type="submit">{label}</button>
    </form>
  );
}

export default async function RequestDetail({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { t, lang } = await getDict();
  const { supabase, user } = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;

  const { data } = await supabase.from("requests").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const r = data as Request;
  const me = user!.id;
  const isRequester = r.requester_id === me;
  const isTraveler = r.traveler_id === me;
  const stats = await statsFor(supabase, [r.requester_id, r.traveler_id ?? ""]);
  const photo = photoUrl(supabase, r.photo_path);

  const { data: contactRows } = isRequester || isTraveler
    ? await supabase.rpc("contact_for_request", { req: r.id })
    : { data: null };
  const contact = (contactRows as { full_name: string; phone: string | null }[] | null)?.[0];

  const { data: tripRows } = r.status === "open" && !isRequester
    ? await supabase.from("trips").select("*").eq("traveler_id", me).gte("flight_date", today()).lte("flight_date", r.needed_by).order("flight_date")
    : { data: null };
  const trips = (tripRows ?? []) as Trip[];

  const { data: myRating } = r.status === "delivered" && (isRequester || isTraveler)
    ? await supabase.from("ratings").select("id").eq("request_id", r.id).eq("rater_id", me).maybeSingle()
    : { data: null };
  const ratee = isRequester ? r.traveler_id : r.requester_id;
  const rateeName = ratee ? stats.get(ratee)?.full_name.split(" ")[0] : "";

  const errorText = error === "accept" ? t.err_terms : error ? t.err_action : null;

  return (
    <div className="page">
      <Link href="/app" className="hint">← {t.back}</Link>
      {errorText && <p className="error">{errorText}</p>}
      <div className="detail">
        <div className="stack">
          <div className="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo ? <img src={photo} alt={r.title} /> : <span>{t[`cat_${r.category}`]}</span>}
          </div>
          {r.description && <p>{r.description}</p>}
        </div>

        <div className="stack">
          <div className="row" style={{ gap: 6 }}>
            <span className={`badge cat-${r.category}`}>{t[`cat_${r.category}`]}</span>
            <StatusBadge status={r.status} t={t} />
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>{r.title}</h1>
          <span className="offer" style={{ fontSize: "1.4rem" }}>{t.d_offer}: CAD {Number(r.offer_cad).toLocaleString(lang)}</span>

          <div className="card">
            <dl className="facts">
              <div><dt>{t.d_weight}</dt><dd>{Number(r.weight_kg).toLocaleString(lang)} kg</dd></div>
              <div><dt>{t.d_size}</dt><dd>{Number(r.length_cm)} × {Number(r.width_cm)} × {Number(r.height_cm)} cm</dd></div>
              <div><dt>{t.d_needed_by}</dt><dd>{formatDate(r.needed_by, lang)}</dd></div>
              {r.item_value !== null && <div><dt>{t.d_value}</dt><dd>{formatMoney(Number(r.item_value), r.item_currency, lang)}</dd></div>}
              <div style={{ gridColumn: "1 / -1" }}>
                <dt>{t.d_pickup}</dt>
                <dd>{r.traveler_buys === null ? t[`pickup_${r.pickup_mode}`] : r.traveler_buys ? t.d_buys : t.d_delivers}</dd>
              </div>
            </dl>
          </div>

          <div className="card stack">
            <Person label={t.d_requested_by} stats={stats.get(r.requester_id)} t={t} />
            {r.traveler_id && <Person label={t.d_carried_by} stats={stats.get(r.traveler_id)} t={t} />}
            {contact && (
              <div className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{t.d_contact}</span>
                <b>{contact.full_name} · {contact.phone ?? "—"}</b>
                <span className="hint">{t.d_contact_hint}</span>
              </div>
            )}
          </div>

          {r.category === "medicine" && (
            <div className="warnbox">
              <b>{t.med_rules_title}</b>
              <span>{t.med_rules}</span>
              <span>{t.med_rules_list}</span>
            </div>
          )}

          {/* Traveler accepts an open request */}
          {r.status === "open" && isRequester && (
            <div className="card stack">
              <p className="hint">{t.own_request}</p>
              <Step id={r.id} next="cancelled" label={t.act_cancel} ghost />
            </div>
          )}
          {r.status === "open" && !isRequester && (
            <form action={advance} className="card stack">
              <h2 style={{ fontSize: "1.3rem" }}>{t.accept_title}</h2>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="next" value="accepted" />
              {trips.length === 0 ? (
                <p className="hint">{t.accept_no_trip} <Link href="/app/viajes/nuevo">{t.app_new_trip}</Link></p>
              ) : (
                <>
                  <label className="field" htmlFor="trip">{t.accept_trip}
                    <select id="trip" name="trip">
                      {trips.map((tr) => (
                        <option key={tr.id} value={tr.id}>
                          {formatDate(tr.flight_date, lang)} · {Number(tr.space_kg)} {t.kg_free}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.pickup_mode === "either" && (
                    <label className="field" htmlFor="buys">{t.accept_buy}
                      <select id="buys" name="buys" defaultValue="no">
                        <option value="no">{t.accept_buy_no}</option>
                        <option value="yes">{t.accept_buy_yes}</option>
                      </select>
                    </label>
                  )}
                  {r.category === "medicine" && (
                    <label className="check" htmlFor="accept_med">
                      <input id="accept_med" name="accept_med" type="checkbox" required />
                      <span>{t.accept_med}</span>
                    </label>
                  )}
                  <label className="check" htmlFor="accept_check">
                    <input id="accept_check" name="accept_check" type="checkbox" required />
                    <span>{t.accept_check}</span>
                  </label>
                  <button className="btn btn-main" type="submit">{t.accept_btn}</button>
                </>
              )}
            </form>
          )}

          {/* Progress after acceptance */}
          {(isRequester || isTraveler) && ["accepted", "handed_over", "in_transit"].includes(r.status) && (
            <div className="card row">
              {r.status === "accepted" && <Step id={r.id} next="handed_over" label={t.act_handed_over} />}
              {r.status === "handed_over" && isTraveler && <Step id={r.id} next="in_transit" label={t.act_in_transit} />}
              {["handed_over", "in_transit"].includes(r.status) && isRequester && <Step id={r.id} next="delivered" label={t.act_delivered} />}
              {r.status === "accepted" && isTraveler && <Step id={r.id} next="open" label={t.act_release} ghost />}
              {r.status === "accepted" && isRequester && <Step id={r.id} next="cancelled" label={t.act_cancel} ghost />}
            </div>
          )}

          {/* Two-way rating after delivery */}
          {r.status === "delivered" && (isRequester || isTraveler) && ratee && (
            myRating ? (
              <p className="success">{t.rated}</p>
            ) : (
              <form action={rate} className="card stack">
                <h2 style={{ fontSize: "1.3rem" }}>{t.rate_title} {rateeName}</h2>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="ratee" value={ratee} />
                <div className="stars-input" role="radiogroup" aria-label={t.rate_title}>
                  {/* Flat siblings so the CSS "~" selector can light up lower stars */}
                  {[5, 4, 3, 2, 1].flatMap((n) => [
                    <input key={`i${n}`} id={`star-${n}`} type="radio" name="stars" value={n} required />,
                    <label key={`l${n}`} htmlFor={`star-${n}`} aria-label={`${n}`}>★</label>,
                  ])}
                </div>
                <label className="field" htmlFor="comment">{t.rate_comment}
                  <textarea id="comment" name="comment" maxLength={500} />
                </label>
                <button className="btn btn-main" type="submit">{t.rate_btn}</button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
