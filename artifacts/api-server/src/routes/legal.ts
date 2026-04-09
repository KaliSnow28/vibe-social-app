import { Router } from "express";

const router = Router();

const BRAND = "Vibe";
const EMAIL = "support@vibe-app.social";
const EFFECTIVE_DATE = "April 9, 2026";

const html = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ${BRAND}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      line-height: 1.75;
      padding: 0;
    }
    header {
      background: linear-gradient(135deg, #E1306C, #833AB4);
      padding: 48px 24px 36px;
      text-align: center;
    }
    header h1 { color: #fff; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
    header p { color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 0.95rem; }
    main { max-width: 780px; margin: 0 auto; padding: 48px 24px 80px; }
    h2 {
      color: #fff;
      font-size: 1.15rem;
      font-weight: 700;
      margin: 36px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #222;
    }
    p, li { color: #bbb; font-size: 0.95rem; margin-bottom: 10px; }
    ul { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 6px; }
    a { color: #E1306C; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge {
      display: inline-block;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 4px 12px;
      font-size: 0.8rem;
      color: #888;
      margin-top: 4px;
    }
    footer {
      text-align: center;
      padding: 32px 24px;
      border-top: 1px solid #1a1a1a;
      color: #555;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${BRAND}</h1>
    <p>${title}</p>
    <span class="badge">Effective: ${EFFECTIVE_DATE}</span>
  </header>
  <main>${body}</main>
  <footer>
    &copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved. &nbsp;|&nbsp;
    <a href="/privacy">Privacy Policy</a> &nbsp;|&nbsp;
    <a href="/terms">Terms of Service</a>
  </footer>
</body>
</html>`;

router.get("/privacy", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(html("Privacy Policy", `
    <p>Welcome to ${BRAND}. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our app.</p>

    <h2>1. Information We Collect</h2>
    <ul>
      <li><strong>Account information:</strong> name, username, email address, profile photo, and bio when you register.</li>
      <li><strong>Content you post:</strong> photos, videos, stories, comments, messages, and other content you share on ${BRAND}.</li>
      <li><strong>Payment information:</strong> when you make purchases, payments are processed by Stripe. We do not store your full card number — Stripe handles all payment data securely.</li>
      <li><strong>Usage data:</strong> pages visited, features used, time spent, and interactions within the app.</li>
      <li><strong>Device information:</strong> device type, operating system, unique device identifiers, and IP address.</li>
      <li><strong>Location data:</strong> approximate location if you choose to share it for features like location tagging on posts.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>Provide, maintain, and improve the ${BRAND} app and its features.</li>
      <li>Process payments and payouts for creators.</li>
      <li>Personalise your feed and content recommendations.</li>
      <li>Send notifications about activity on your account.</li>
      <li>Detect and prevent fraud, abuse, and violations of our Terms of Service.</li>
      <li>Comply with legal obligations.</li>
    </ul>

    <h2>3. Sharing Your Information</h2>
    <p>We do not sell your personal data. We may share information with:</p>
    <ul>
      <li><strong>Service providers:</strong> third-party companies that help us operate the app (e.g. Stripe for payments, cloud hosting providers).</li>
      <li><strong>Other users:</strong> content you post publicly is visible to other users of ${BRAND}.</li>
      <li><strong>Law enforcement:</strong> when required by law or to protect the safety of our users.</li>
    </ul>

    <h2>4. Data Retention</h2>
    <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

    <h2>5. Your Rights</h2>
    <p>Depending on your location, you may have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you.</li>
      <li>Request correction of inaccurate data.</li>
      <li>Request deletion of your data.</li>
      <li>Opt out of certain data processing activities.</li>
      <li>Data portability — receive a copy of your data in a machine-readable format.</li>
    </ul>
    <p>To exercise any of these rights, contact us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

    <h2>6. Children's Privacy</h2>
    <p>${BRAND} is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>

    <h2>7. Security</h2>
    <p>We use industry-standard security measures including encryption in transit (TLS) and at rest to protect your data. Payment information is handled exclusively by Stripe, which is PCI-DSS compliant.</p>

    <h2>8. Third-Party Links</h2>
    <p>The app may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties.</p>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or via email. Your continued use of ${BRAND} after changes are posted constitutes acceptance of the updated policy.</p>

    <h2>10. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at:<br/>
    <a href="mailto:${EMAIL}">${EMAIL}</a></p>
  `));
});

router.get("/terms", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(html("Terms of Service", `
    <p>These Terms of Service ("Terms") govern your use of ${BRAND} ("the App"). By using ${BRAND}, you agree to these Terms. Please read them carefully.</p>

    <h2>1. Eligibility</h2>
    <p>You must be at least 13 years old to use ${BRAND}. By using the app, you confirm that you meet this requirement.</p>

    <h2>2. Your Account</h2>
    <ul>
      <li>You are responsible for maintaining the security of your account and password.</li>
      <li>You must not share your account credentials with others.</li>
      <li>You are responsible for all activity that occurs under your account.</li>
    </ul>

    <h2>3. Content Guidelines</h2>
    <p>You agree not to post content that:</p>
    <ul>
      <li>Is illegal, harmful, threatening, abusive, or harassing.</li>
      <li>Infringes on the intellectual property rights of others.</li>
      <li>Contains nudity, graphic violence, or adult content.</li>
      <li>Spreads misinformation or is deliberately deceptive.</li>
      <li>Promotes hate speech or discrimination.</li>
    </ul>

    <h2>4. Payments and Subscriptions</h2>
    <ul>
      <li>All payments are processed securely through Stripe.</li>
      <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
      <li>Creator payouts are subject to a 5% platform fee.</li>
      <li>Refunds are handled on a case-by-case basis. Contact <a href="mailto:${EMAIL}">${EMAIL}</a> for refund requests.</li>
    </ul>

    <h2>5. Creator Monetisation</h2>
    <p>Creators on ${BRAND} may earn money through tips, subscriptions, and content sales. ${BRAND} takes a 5% platform fee on all transactions. Creators are responsible for reporting and paying any applicable taxes on their earnings.</p>

    <h2>6. Intellectual Property</h2>
    <p>You retain ownership of content you post on ${BRAND}. By posting, you grant ${BRAND} a non-exclusive, royalty-free licence to display, distribute, and promote your content within the app.</p>

    <h2>7. Termination</h2>
    <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may delete your account at any time through the app's settings.</p>

    <h2>8. Disclaimer of Warranties</h2>
    <p>${BRAND} is provided "as is" without warranties of any kind. We do not guarantee that the app will be available at all times or free from errors.</p>

    <h2>9. Limitation of Liability</h2>
    <p>To the maximum extent permitted by law, ${BRAND} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>

    <h2>10. Changes to Terms</h2>
    <p>We may update these Terms from time to time. Continued use of ${BRAND} after changes are posted constitutes acceptance of the updated Terms.</p>

    <h2>11. Contact</h2>
    <p>For any questions about these Terms, contact us at:<br/>
    <a href="mailto:${EMAIL}">${EMAIL}</a></p>
  `));
});

export default router;
