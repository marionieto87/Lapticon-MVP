"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { categories } from "@/lib/i18n";
import { today } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));

export async function createRequest(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const category = String(formData.get("category"));
  const fields = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category,
    length_cm: num(formData.get("length_cm")),
    width_cm: num(formData.get("width_cm")),
    height_cm: num(formData.get("height_cm")),
    weight_kg: num(formData.get("weight_kg")),
    item_value: formData.get("item_value") ? num(formData.get("item_value")) : null,
    item_currency: formData.get("item_currency") === "CAD" ? "CAD" : "COP",
    pickup_mode: ["requester_delivers", "traveler_buys", "either"].includes(String(formData.get("pickup_mode")))
      ? String(formData.get("pickup_mode"))
      : "requester_delivers",
    needed_by: String(formData.get("needed_by") ?? ""),
    offer_cad: num(formData.get("offer_cad")),
  };

  const valid =
    fields.title &&
    (categories as readonly string[]).includes(category) &&
    [fields.length_cm, fields.width_cm, fields.height_cm].every((n) => n > 0) &&
    fields.weight_kg > 0 && fields.weight_kg <= 23 &&
    fields.offer_cad >= 0 &&
    fields.needed_by > today();
  if (!valid) redirect("/app/encargos/nuevo?error=fields");
  if (formData.get("terms") !== "on") redirect("/app/encargos/nuevo?error=terms");
  const isMedicine = category === "medicine";
  if (isMedicine && formData.get("medicine_rules") !== "on") redirect("/app/encargos/nuevo?error=med");

  let photo_path: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[photo.type];
    if (!ext || photo.size > 5 * 1024 * 1024) redirect("/app/encargos/nuevo?error=photo");
    photo_path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("photos").upload(photo_path, photo, { contentType: photo.type });
    if (error) redirect("/app/encargos/nuevo?error=photo");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("requests")
    .insert({
      ...fields,
      requester_id: user.id,
      photo_path,
      terms_accepted_at: now,
      medicine_rules_accepted_at: isMedicine ? now : null,
    })
    .select("id")
    .single();
  if (error || !data) redirect("/app/encargos/nuevo?error=fields");

  revalidatePath("/app");
  redirect(`/app/encargos/${data.id}`);
}

export async function advance(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const next = String(formData.get("next"));
  const trip = String(formData.get("trip") ?? "") || null;
  const buysRaw = formData.get("buys");

  if (next === "accepted") {
    const { data: req } = await supabase.from("requests").select("category").eq("id", id).single();
    const medOk = req?.category !== "medicine" || formData.get("accept_med") === "on";
    if (formData.get("accept_check") !== "on" || !medOk || !trip) redirect(`/app/encargos/${id}?error=accept`);
  }

  const { error } = await supabase.rpc("advance_request", {
    req: id,
    next_status: next,
    trip,
    buys: buysRaw === null ? null : buysRaw === "yes",
  });
  revalidatePath(`/app/encargos/${id}`);
  redirect(`/app/encargos/${id}${error ? "?error=action" : ""}`);
}

export async function rate(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const stars = Number(formData.get("stars"));
  if (!user || !(stars >= 1 && stars <= 5)) redirect(`/app/encargos/${id}?error=action`);
  const { error } = await supabase.from("ratings").insert({
    request_id: id,
    rater_id: user.id,
    ratee_id: String(formData.get("ratee")),
    stars,
    comment: String(formData.get("comment") ?? "").trim() || null,
  });
  revalidatePath(`/app/encargos/${id}`);
  redirect(`/app/encargos/${id}${error ? "?error=action" : ""}`);
}
