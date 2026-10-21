import Link from "next/link";
import { formatDate, type Dict, type Lang } from "@/lib/i18n";
import type { Request, Stats } from "@/lib/data";
import { LevelBadge, StatusBadge } from "./Badges";

export function RequestCard({ r, stats, photo, t, lang, showStatus = false }: {
  r: Request; stats?: Stats; photo: string | null; t: Dict; lang: Lang; showStatus?: boolean;
}) {
  return (
    <Link className="req" href={`/app/encargos/${r.id}`}>
      <div className="ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img src={photo} alt="" /> : <span>{t[`cat_${r.category}`]}</span>}
      </div>
      <div className="body">
        <div className="row" style={{ gap: 6 }}>
          <span className={`badge cat-${r.category}`}>{t[`cat_${r.category}`]}</span>
          {showStatus ? <StatusBadge status={r.status} t={t} /> : <LevelBadge stats={stats} t={t} />}
        </div>
        <h3>{r.title}</h3>
        <div className="meta">
          <span>{Number(r.weight_kg).toLocaleString(lang)} kg</span>
          <span>{Number(r.length_cm)}×{Number(r.width_cm)}×{Number(r.height_cm)} cm</span>
          <span>{t.d_needed_by} {formatDate(r.needed_by, lang)}</span>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="offer">CAD {Number(r.offer_cad).toLocaleString(lang)}</span>
          {stats && <span className="hint">{stats.full_name.split(" ")[0]}</span>}
        </div>
      </div>
    </Link>
  );
}
