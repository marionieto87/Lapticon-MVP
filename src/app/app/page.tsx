import Link from "next/link";
import { RequestCard } from "@/components/RequestCard";
import { categories, levelMin, type Level } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { photoUrl, statsFor, today, type Request } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

type SP = { peso?: string; cat?: string; desde?: string; nivel?: string };

export default async function Explore({ searchParams }: { searchParams: Promise<SP> }) {
  const { t, lang } = await getDict();
  const { supabase, user } = await requireUser();
  const sp = await searchParams;

  let query = supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .gte("needed_by", sp.desde || today())
    .neq("requester_id", user!.id)
    .order("needed_by", { ascending: true })
    .limit(200);
  const maxWeight = Number(sp.peso);
  if (maxWeight > 0) query = query.lte("weight_kg", maxWeight);
  if (sp.cat && (categories as readonly string[]).includes(sp.cat)) query = query.eq("category", sp.cat);

  const { data } = await query;
  const requests = (data ?? []) as Request[];
  const stats = await statsFor(supabase, requests.map((r) => r.requester_id));
  const minLevel = levelMin[(sp.nivel as Level) ?? "new"] ?? 0;
  const shown = requests.filter((r) => (stats.get(r.requester_id)?.requests_delivered ?? 0) >= minLevel);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{t.explore_title}</h1>
          <p>{t.explore_sub}</p>
        </div>
        <span className="hint">{shown.length} {t.results}</span>
      </div>

      <form className="card filters" method="get">
        <label className="field" htmlFor="peso">{t.filter_weight}
          <input id="peso" name="peso" type="number" min="0.1" step="0.1" defaultValue={sp.peso ?? ""} />
        </label>
        <label className="field" htmlFor="cat">{t.filter_category}
          <select id="cat" name="cat" defaultValue={sp.cat ?? ""}>
            <option value="">{t.filter_any}</option>
            {categories.map((c) => <option key={c} value={c}>{t[`cat_${c}`]}</option>)}
          </select>
        </label>
        <label className="field" htmlFor="desde">{t.filter_by}
          <input id="desde" name="desde" type="date" defaultValue={sp.desde ?? ""} />
        </label>
        <label className="field" htmlFor="nivel">{t.filter_level}
          <select id="nivel" name="nivel" defaultValue={sp.nivel ?? ""}>
            <option value="">{t.filter_any}</option>
            <option value="bronze">{t.lvl_min_bronze}</option>
            <option value="silver">{t.lvl_min_silver}</option>
            <option value="gold">{t.lvl_min_gold}</option>
          </select>
        </label>
        <div className="row">
          <button className="btn btn-main" type="submit">{t.filter_btn}</button>
          <Link href="/app" className="hint">{t.filter_clear}</Link>
        </div>
      </form>

      {shown.length === 0 ? (
        <p className="empty">{t.explore_empty}</p>
      ) : (
        <div className="cards">
          {shown.map((r) => (
            <RequestCard key={r.id} r={r} stats={stats.get(r.requester_id)} photo={photoUrl(supabase, r.photo_path)} t={t} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
