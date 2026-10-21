import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "./i18n";

export type Status = "open" | "accepted" | "handed_over" | "in_transit" | "delivered" | "cancelled";
export type PickupMode = "requester_delivers" | "traveler_buys" | "either";

export type Request = {
  id: string;
  requester_id: string;
  title: string;
  description: string | null;
  category: Category;
  photo_path: string | null;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  item_value: number | null;
  item_currency: "COP" | "CAD";
  pickup_mode: PickupMode;
  needed_by: string;
  offer_cad: number;
  status: Status;
  traveler_id: string | null;
  trip_id: string | null;
  traveler_buys: boolean | null;
  created_at: string;
};

export type Trip = {
  id: string;
  traveler_id: string;
  flight_date: string;
  origin: string;
  destination: string;
  space_kg: number;
  notes: string | null;
};

export type Stats = {
  id: string;
  full_name: string;
  city: string | null;
  requests_delivered: number;
  requests_posted: number;
  trips_delivered: number;
  avg_stars: number | null;
  ratings_count: number;
};

export async function statsFor(supabase: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, Stats>();
  if (unique.length === 0) return map;
  const { data } = await supabase.from("profile_stats").select("*").in("id", unique);
  for (const row of (data ?? []) as Stats[]) {
    map.set(row.id, {
      ...row,
      requests_delivered: Number(row.requests_delivered),
      requests_posted: Number(row.requests_posted),
      trips_delivered: Number(row.trips_delivered),
      ratings_count: Number(row.ratings_count),
      avg_stars: row.avg_stars === null ? null : Number(row.avg_stars),
    });
  }
  return map;
}

export function photoUrl(supabase: SupabaseClient, path: string | null) {
  if (!path) return null;
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
