"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/app") ? next : "/app";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect("/login?error=1");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "both");
  const role = ["send", "travel", "both"].includes(roleRaw) ? roleRaw : "both";
  if (!fullName || !email || password.length < 8) redirect("/registro?error=1");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, city, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });
  if (error) redirect("/registro?error=1");
  // With email confirmation on, there is no session until the user clicks the link.
  if (!data.session) redirect("/login?check=1");
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
