// Serverless contact endpoint.
// Receives the website contact form and forwards it by email via Resend.
// The destination address lives ONLY in env (CONTACT_TO) — it is never sent
// to the browser, so the public site exposes no email address.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    const honeypot = String(body.company || '').trim();

    // Bot filled the hidden field — accept silently, send nothing.
    if (honeypot) return res.status(200).json({ ok: true });

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }
    if (name.length > 100 || message.length > 5000) {
      return res.status(400).json({ ok: false, error: 'Input too long' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;
    const from = process.env.CONTACT_FROM || 'ActivityVideoStudio <onboarding@resend.dev>';
    if (!apiKey || !to) {
      return res.status(500).json({ ok: false, error: 'Server not configured' });
    }

    const text =
      `New contact from the ActivityVideoStudio website\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message}\n`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[ActivityVideoStudio] お問い合わせ — ${name}`,
        text,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('resend error', r.status, detail);
      return res.status(502).json({ ok: false, error: 'Mail delivery failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact handler error', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
