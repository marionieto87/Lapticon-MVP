import { getDict } from "@/lib/lang";
import { today } from "@/lib/data";
import { createTrip } from "../actions";

export default async function NewTrip({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { t } = await getDict();
  const { error } = await searchParams;
  return (
    <div className="page narrow center">
      <div className="page-head">
        <div>
          <h1>{t.app_new_trip}</h1>
          <p className="meta" style={{ marginTop: 8 }}>BOG El Dorado → YUL Montréal-Trudeau</p>
        </div>
      </div>
      {error && <p className="error">{t.err_trip}</p>}
      <form action={createTrip} className="card stack">
        <div className="grid-2">
          <label className="field" htmlFor="flight_date">{t.trip_date}
            <input id="flight_date" name="flight_date" type="date" min={today()} required />
          </label>
          <label className="field" htmlFor="space_kg">{t.trip_space}
            <input id="space_kg" name="space_kg" type="number" min="0.5" max="46" step="0.5" required />
          </label>
        </div>
        <label className="field" htmlFor="notes">{t.trip_notes}
          <textarea id="notes" name="notes" placeholder={t.trip_notes_ph} maxLength={300} />
        </label>
        <button className="btn btn-main" type="submit">{t.trip_publish}</button>
      </form>
    </div>
  );
}
