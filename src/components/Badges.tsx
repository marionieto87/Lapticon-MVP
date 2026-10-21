import { levelFor, type Dict } from "@/lib/i18n";
import type { Stats, Status } from "@/lib/data";

const levelKey = { new: "lvl_new", bronze: "lvl_bronze", silver: "lvl_silver", gold: "lvl_gold" } as const;

export function LevelBadge({ stats, t }: { stats?: Stats; t: Dict }) {
  const level = levelFor(stats?.requests_delivered ?? 0);
  return <span className={`badge lvl-${level}`}>{t[levelKey[level]]}</span>;
}

export function StatusBadge({ status, t }: { status: Status; t: Dict }) {
  return <span className={`badge st-${status}`}>{t[`st_${status}`]}</span>;
}

export function Stars({ stats, t }: { stats?: Stats; t: Dict }) {
  if (!stats || stats.ratings_count === 0) return <span className="hint">{t.no_ratings}</span>;
  return (
    <span className="hint">
      <span className="stars" aria-hidden="true">★</span> {stats.avg_stars?.toFixed(1)} ({stats.ratings_count})
    </span>
  );
}
