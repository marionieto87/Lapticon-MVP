"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { today } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export async function createTrip(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const flight_date = String(formData.get("flight_date") ?? "");
  const space_kg = Number(String(formData.get("space_kg") ?? "").replace(",", "."));
  if (!(flight_date >= today()) || !(space_kg >= 0.5 && space_kg <= 46)) redirect("/app/viajes/nuevo?error=1");

  const { error } = await supabase.from("trips").insert({
    traveler_id: user.id,
    flight_date,
    space_kg,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) redirect("/app/viajes/nuevo?error=1");
  revalidatePath("/app/viajes");
  redirect("/app");
}

export async function deleteTrip(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("trips").delete().eq("id", String(formData.get("id")));
  revalidatePath("/app/viajes");
  redirect("/app/viajes");
}
