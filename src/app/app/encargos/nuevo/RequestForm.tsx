"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";
import { categories } from "@/lib/i18n";

export function RequestForm({ t, action, minDate }: { t: Dict; action: (fd: FormData) => Promise<void>; minDate: string }) {
  const [category, setCategory] = useState("sweets");
  const [sending, setSending] = useState(false);

  return (
    <form action={action} onSubmit={() => setSending(true)} className="card stack">
      <label className="field" htmlFor="title">{t.r_title}
        <input id="title" name="title" placeholder={t.r_title_ph} maxLength={120} required />
      </label>
      <div className="grid-2">
        <label className="field" htmlFor="category">{t.filter_category}
          <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{t[`cat_${c}`]}</option>)}
          </select>
        </label>
        <label className="field" htmlFor="photo">{t.r_photo}
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
          <small>{t.r_photo_hint}</small>
        </label>
      </div>
      <label className="field" htmlFor="description">{t.r_desc}
        <textarea id="description" name="description" placeholder={t.r_desc_ph} maxLength={1000} />
      </label>

      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field" style={{ marginBottom: 6 }}>{t.r_size}</legend>
        <div className="grid-3">
          <label className="field" htmlFor="length_cm"><small>{t.r_length}</small>
            <input id="length_cm" name="length_cm" type="number" min="1" step="0.5" required />
          </label>
          <label className="field" htmlFor="width_cm"><small>{t.r_width}</small>
            <input id="width_cm" name="width_cm" type="number" min="1" step="0.5" required />
          </label>
          <label className="field" htmlFor="height_cm"><small>{t.r_height}</small>
            <input id="height_cm" name="height_cm" type="number" min="1" step="0.5" required />
          </label>
        </div>
      </fieldset>

      <div className="grid-3">
        <label className="field" htmlFor="weight_kg">{t.r_weight}
          <input id="weight_kg" name="weight_kg" type="number" min="0.1" max="23" step="0.1" required />
        </label>
        <label className="field" htmlFor="item_value">{t.r_value}
          <input id="item_value" name="item_value" type="number" min="0" step="1" />
        </label>
        <label className="field" htmlFor="item_currency">{t.r_currency}
          <select id="item_currency" name="item_currency" defaultValue="COP">
            <option value="COP">COP</option>
            <option value="CAD">CAD</option>
          </select>
        </label>
      </div>

      <label className="field" htmlFor="pickup_mode">{t.r_pickup}
        <select id="pickup_mode" name="pickup_mode" defaultValue="either">
          <option value="requester_delivers">{t.pickup_requester_delivers}</option>
          <option value="traveler_buys">{t.pickup_traveler_buys}</option>
          <option value="either">{t.pickup_either}</option>
        </select>
      </label>

      <div className="grid-2">
        <label className="field" htmlFor="needed_by">{t.r_needed_by}
          <input id="needed_by" name="needed_by" type="date" min={minDate} required />
        </label>
        <label className="field" htmlFor="offer_cad">{t.r_offer}
          <input id="offer_cad" name="offer_cad" type="number" min="0" step="1" required />
          <small>{t.r_offer_hint}</small>
        </label>
      </div>

      {category === "medicine" && (
        <div className="warnbox">
          <b>{t.med_rules_title}</b>
          <span>{t.med_rules}</span>
          <span>{t.med_rules_list}</span>
          <label className="check" htmlFor="medicine_rules">
            <input id="medicine_rules" name="medicine_rules" type="checkbox" required />
            <span>{t.med_label}</span>
          </label>
        </div>
      )}

      <label className="check" htmlFor="terms">
        <input id="terms" name="terms" type="checkbox" required />
        <span>{t.terms_label}</span>
      </label>

      <button className="btn btn-main" type="submit" disabled={sending}>{t.publish}</button>
    </form>
  );
}
