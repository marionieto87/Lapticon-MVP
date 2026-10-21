import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { getDict } from "@/lib/lang";
import { requireUser } from "@/lib/supabase/server";

export default async function Landing() {
  const { t, lang } = await getDict();
  const { user } = await requireUser();
  const start = user ? "/app" : "/registro";

  return (
    <>
      <SiteHeader t={t} lang={lang} signedIn={!!user} landing />
      <main id="top">
        <div className="wrap hero">
          <div>
            <p className="eyebrow">{t.hero_eyebrow}</p>
            <h1>
              {t.hero_title_a} <em>{t.hero_title_em}</em> {t.hero_title_b}
            </h1>
            <p className="lead">{t.hero_lead}</p>
            <div className="ctas">
              <Link className="btn btn-main" href={user ? "/app/encargos/nuevo" : start}>{t.cta_send}</Link>
              <Link className="btn btn-ghost" href={user ? "/app/viajes/nuevo" : start}>{t.cta_travel}</Link>
            </div>
            <p className="route">
              <b>BOG</b> El Dorado <span aria-hidden="true">→</span> <b>YUL</b> Montréal-Trudeau · {t.route_pilot}
            </p>
          </div>

          <div className="tag" aria-label={t.sample}>
            <span className="sample">{t.sample}</span>
            <div className="codes">BOG <span aria-hidden="true">✈</span> YUL</div>
            <div className="cities"><span>Bogotá</span><span>Montréal</span></div>
            <hr />
            <dl>
              <div className="item"><dt>{t.tag_item}</dt><dd>{t.tag_item_v}</dd></div>
              <div><dt>{t.tag_weight}</dt><dd>1,2 kg</dd></div>
              <div><dt>{t.tag_size}</dt><dd>20 × 15 × 10 cm</dd></div>
              <div><dt>{t.tag_offer}</dt><dd>CAD 25</dd></div>
              <div><dt>{t.tag_by}</dt><dd>{t.tag_by_v}</dd></div>
            </dl>
            <div className="barcode" aria-hidden="true" />
          </div>
        </div>

        <section id="como">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">{t.how_eyebrow}</p>
              <h2>{t.how_title}</h2>
            </div>
            <div className="two">
              <div className="panel">
                <h3>{t.how_send_t} <small>{t.how_send_where}</small></h3>
                <ol className="steps">
                  <li><div><b>{t.s1_t}</b><span>{t.s1_d}</span></div></li>
                  <li><div><b>{t.s2_t}</b><span>{t.s2_d}</span></div></li>
                  <li><div><b>{t.s3_t}</b><span>{t.s3_d}</span></div></li>
                  <li><div><b>{t.s4_t}</b><span>{t.s4_d}</span></div></li>
                </ol>
              </div>
              <div className="panel">
                <h3>{t.how_travel_t} <small>{t.how_travel_where}</small></h3>
                <ol className="steps">
                  <li><div><b>{t.t1_t}</b><span>{t.t1_d}</span></div></li>
                  <li><div><b>{t.t2_t}</b><span>{t.t2_d}</span></div></li>
                  <li><div><b>{t.t3_t}</b><span>{t.t3_d}</span></div></li>
                  <li><div><b>{t.t4_t}</b><span>{t.t4_d}</span></div></li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="que">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">{t.what_eyebrow}</p>
              <h2>{t.what_title}</h2>
              <p>{t.what_lead}</p>
            </div>
            <div className="rules">
              <div className="rule ok">
                <span className="pill">{t.ok_pill}</span>
                <ul><li>{t.ok_1}</li><li>{t.ok_2}</li><li>{t.ok_3}</li></ul>
              </div>
              <div className="rule warn">
                <span className="pill">{t.warn_pill}</span>
                <ul><li>{t.warn_1}</li><li>{t.warn_2}</li><li>{t.warn_3}</li></ul>
                <p>{t.warn_note}</p>
              </div>
              <div className="rule no">
                <span className="pill">{t.no_pill}</span>
                <ul><li>{t.no_1}</li><li>{t.no_2}</li><li>{t.no_3}</li></ul>
              </div>
            </div>
            <p className="note">{t.what_note}</p>
          </div>
        </section>

        <section id="confianza">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">{t.trust_eyebrow}</p>
              <h2>{t.trust_title}</h2>
            </div>
            <div className="trust">
              <div>
                <h3><span className="stars" aria-hidden="true">★★★★★</span><br />{t.tr1_t}</h3>
                <p>{t.tr1_d}</p>
              </div>
              <div><h3>{t.tr2_t}</h3><p>{t.tr2_d}</p></div>
              <div><h3>{t.tr3_t}</h3><p>{t.tr3_d}</p></div>
              <div><h3>{t.tr4_t}</h3><p>{t.tr4_d}</p></div>
            </div>
          </div>
        </section>

        <section className="band" id="registro">
          <div className="wrap grid">
            <div>
              <p className="eyebrow">{t.price_eyebrow}</p>
              <div className="price">CAD 0</div>
              <h2>{t.price_title}</h2>
              <p>{t.price_d}</p>
            </div>
            <div style={{ alignSelf: "center" }}>
              <Link className="btn btn-main" href={start} style={{ background: "var(--soft)", color: "#053D57" }}>
                {user ? t.nav_app : t.price_cta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
