// Vercel Serverless Function: /api/send-email
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, name, city, passId } = req.body;

    if (!to || !city) {
      return res.status(400).json({ error: 'Missing recipient email or city' });
    }

    const API_KEY = process.env.RESEND_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY environment variable is not configured' });
    }

    const cleanName = name || 'XO Fan';
    const cleanCity = city || 'India';
    const cleanPassId = passId || ('XO-IND-' + Math.random().toString(36).substring(2, 7).toUpperCase());

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050508; color: #f4f4f7; margin: 0; padding: 24px 12px; }
    .card { max-width: 540px; margin: 0 auto; background: #0e0f17; border: 1px solid rgba(237, 41, 23, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    .header { background: linear-gradient(135deg, #1c0a0c 0%, #0e0f17 100%); border-bottom: 2px solid #ed2917; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(237, 41, 23, 0.2); border: 1px solid rgba(237, 41, 23, 0.5); color: #ff5a46; font-size: 10px; font-weight: 800; letter-spacing: 2px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px; }
    h1 { color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 24px; font-size: 13.5px; line-height: 1.6; color: #d1cbd4; }
    .pass-box { background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(237, 41, 23, 0.5); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; }
    .pass-num { font-size: 20px; font-weight: 800; color: #ff5a46; letter-spacing: 2px; font-family: monospace; }
    .footer { background: #08080c; border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 16px 24px; text-align: center; font-size: 11px; color: #736f7a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">VERIFIED FAN DOSSIER</div>
      <h1>THE WEEKND IN INDIA</h1>
      <p style="margin: 6px 0 0; color: #ffb703; font-size: 12px; font-weight: 700;">OFFICIAL DEMAND REGISTRATION</p>
    </div>
    <div class="body">
      <p>Hey <strong>${cleanName}</strong>,</p>
      <p>Your official demand vote for <strong>${cleanCity}</strong> has been successfully recorded in India's verified XO Fan Dossier!</p>
      
      <div class="pass-box">
        <div style="font-size: 11px; color: #9e9ba8; text-transform: uppercase; margin-bottom: 4px;">Verified Fan Priority ID</div>
        <div class="pass-num">${cleanPassId}</div>
        <div style="font-size: 11.5px; color: #00ff88; margin-top: 6px;">● 100% Free & Verified Demand</div>
      </div>

      <p>We are aggregating city-wise demand data to present directly to Abel Tesfaye's global touring team, Live Nation, and BookMyShow.</p>
      <p>Keep an eye on <a href="https://theweeknd.co.in" style="color: #ff5a46; text-decoration: none; font-weight: 700;">theweeknd.co.in</a> for live city leaderboards and tour updates.</p>
      
      <p style="margin-bottom: 0;">Together for Abel,<br><strong>The XO India Community</strong><br><span style="font-size: 12px; color: #736f7a;">theweeknd.co.in</span></p>
    </div>
    <div class="footer">
      Independent cultural initiative built by fans for fans. Sent from campaign@theweeknd.co.in.
    </div>
  </div>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "The Weeknd India <campaign@theweeknd.co.in>",
        to: [to],
        reply_to: "india@theweeknd.co.in",
        subject: `Your Verified Fan Dossier: The Weeknd in India (${cleanCity}) 🇮🇳🖤`,
        html: htmlContent
      })
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({ error: result });
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
