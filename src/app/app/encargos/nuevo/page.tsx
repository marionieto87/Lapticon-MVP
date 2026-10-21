import { getDict } from "@/lib/lang";
import { createRequest } from "../actions";
import { RequestForm } from "./RequestForm";

export default async function NewRequest({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { t } = await getDict();
  const { error } = await searchParams;
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const message = { fields: t.err_request, terms: t.err_terms, med: t.err_med, photo: t.err_photo }[error ?? ""];

  return (
    <div className="page narrow center">
      <div className="page-head"><h1>{t.app_new_request}</h1></div>
      {message && <p className="error">{message}</p>}
      <RequestForm t={t} action={createRequest} minDate={tomorrow} />
    </div>
  );
}
