export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, attending, events, guests, diet, message, at } = req.body || {};

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.error("RESEND_API_KEY not set");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const attending_yes = attending === "yes";

  const eventsLabel = {
    lubumbashi: "Lubumbashi — Cérémonie Civile (30 oct. 2026)",
    zanzibar:   "Zanzibar — Cérémonie Religieuse (28 nov. 2026)",
    both:       "Les deux célébrations (Lubumbashi + Zanzibar)"
  }[events] || events || "—";

  const dateStr = (() => {
    try {
      return new Date(at || Date.now()).toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch (_) { return new Date().toDateString(); }
  })();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f5f2ee;font-family:Georgia,'Times New Roman',serif;color:#2d2620}
  .shell{max-width:580px;margin:32px auto;background:#fff;border:1px solid #e0d8cc}
  .top{background:#1c1612;text-align:center;padding:40px 32px 32px}
  .top .names{font-style:italic;font-size:40px;color:#c9a96e;letter-spacing:.02em;line-height:1;display:block}
  .top .tag{font-size:11px;letter-spacing:.16em;color:#806a50;text-transform:uppercase;margin-top:10px;display:block}
  .badge{text-align:center;padding:24px 32px 20px;border-bottom:1px solid #f0ebe4}
  .pill{display:inline-block;padding:10px 28px;border-radius:40px;font-size:15px;letter-spacing:.04em}
  .pill.yes{background:#faf6ee;border:1px solid #c9a96e;color:#8a6630}
  .pill.no{background:#faf9f9;border:1px solid #ccc;color:#777}
  .section{padding:28px 36px;border-bottom:1px solid #f0ebe4}
  .section:last-of-type{border-bottom:none}
  .row{display:flex;gap:32px;flex-wrap:wrap;margin-bottom:20px}
  .row:last-child{margin-bottom:0}
  .col{flex:1;min-width:140px}
  .lbl{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9a8778;margin-bottom:5px;font-family:Arial,sans-serif}
  .val{font-size:15.5px;color:#1c1612;line-height:1.5}
  .val a{color:#8a6630;text-decoration:none}
  .msg-box{background:#faf8f5;border-left:3px solid #c9a96e;padding:16px 20px;margin-top:12px}
  .msg-box p{font-style:italic;font-size:15px;color:#5a4a3a;line-height:1.75}
  .foot{text-align:center;padding:20px 32px;background:#faf8f5;border-top:1px solid #f0ebe4}
  .foot p{font-size:11px;color:#a89880;letter-spacing:.04em;font-family:Arial,sans-serif}
  .hr{width:36px;height:1px;background:#c9a96e;margin:0 auto 8px}
</style>
</head>
<body>
<div class="shell">

  <div class="top">
    <span class="names">Sifa &amp; Tommy</span>
    <span class="tag">Nouvelle réponse RSVP</span>
  </div>

  <div class="badge">
    <span class="pill ${attending_yes ? "yes" : "no"}">${attending_yes ? "✓ &nbsp;Présent·e avec joie" : "✗ &nbsp;Absent·e avec regrets"}</span>
  </div>

  <div class="section">
    <div class="row">
      <div class="col">
        <p class="lbl">Nom complet</p>
        <p class="val"><strong>${name || "—"}</strong></p>
      </div>
      <div class="col">
        <p class="lbl">Adresse e-mail</p>
        <p class="val"><a href="mailto:${email}">${email || "—"}</a></p>
      </div>
    </div>
    ${attending_yes ? `
    <div class="row">
      <div class="col">
        <p class="lbl">Célébration(s)</p>
        <p class="val">${eventsLabel}</p>
      </div>
      <div class="col">
        <p class="lbl">Nombre de personnes</p>
        <p class="val">${guests || "—"}</p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p class="lbl">Régime alimentaire / Allergies</p>
        <p class="val">${diet || "Aucune restriction signalée"}</p>
      </div>
    </div>
    ` : ""}
  </div>

  ${message ? `
  <div class="section">
    <p class="lbl">Message pour les mariés</p>
    <div class="msg-box"><p>&ldquo;${message}&rdquo;</p></div>
  </div>
  ` : ""}

  <div class="foot">
    <div class="hr"></div>
    <p>Reçu le ${dateStr}</p>
  </div>

</div>
</body>
</html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Sifa & Tommy RSVP <onboarding@resend.dev>",
        to: ["jeanrochangoue@gmail.com"],
        reply_to: email || undefined,
        subject: `RSVP • ${name} — ${attending_yes ? "✓ Présent·e" : "✗ Absent·e"}`,
        html
      })
    });

    if (!r.ok) {
      const body = await r.text();
      console.error("Resend error:", r.status, body);
      return res.status(502).json({ error: "Email delivery failed" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("RSVP handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
