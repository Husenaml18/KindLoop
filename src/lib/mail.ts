import "server-only";

/**
 * Sending the sign-in link.
 *
 * No mail library. Resend's REST API is one `fetch`, and pulling in nodemailer to
 * send a single transactional email would add a dependency, a build target and an
 * SMTP configuration surface for no benefit.
 *
 * With no key configured the link is printed to the terminal instead. That is the
 * same bargain the mock checkout makes: the whole product stays testable end to end
 * before any third-party account exists, and the moment a real key is set the
 * console path stops being reachable. It is *not* a fallback in production — see
 * `deliverMagicLink`, which refuses to log the link there.
 */

export interface MagicLink {
  to: string;
  url: string;
  expires: Date;
}

export const hasMailer = Boolean(process.env.AUTH_RESEND_KEY);

const FROM = process.env.AUTH_EMAIL_FROM ?? "Kindloop <onboarding@resend.dev>";

function minutesUntil(when: Date): number {
  return Math.max(1, Math.round((when.getTime() - Date.now()) / 60000));
}

/**
 * The email itself.
 *
 * Deliberately plain: a link this important should look like a utility, not like
 * marketing, and anything ornate is more likely to be junked. Inline styles only —
 * every mail client strips a stylesheet.
 */
function render({ url, expires }: { url: string; expires: Date }): { html: string; text: string } {
  const mins = minutesUntil(expires);

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#e8d9bd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#f2e9d4;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:36px 34px 30px;">
        <p style="margin:0 0 22px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7a5c3e;">Kindloop</p>
        <h1 style="margin:0 0 14px;font-size:23px;line-height:1.25;font-weight:600;color:#2b2013;">Here's your way in</h1>
        <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#6b5642;">
          Press the button and you'll be signed in. No password to remember.
        </p>
        <a href="${url}" style="display:inline-block;padding:13px 28px;border-radius:999px;background:#3d2517;color:#f2e9d4;font-size:15px;font-weight:500;text-decoration:none;">
          Sign in to Kindloop
        </a>
        <p style="margin:26px 0 0;font-size:13px;line-height:1.6;color:#8f7a63;">
          The link works once and expires in ${mins} minute${mins === 1 ? "" : "s"}.
          If you didn't ask for it, you can ignore this — nobody can get in without it.
        </p>
      </td></tr>
      <tr><td style="padding:0 34px 30px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#8f7a63;word-break:break-all;">
          Button not working? Paste this into your browser:<br />
          <span style="color:#6b5642;">${url}</span>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    "Here's your way in.",
    "",
    "Open this link and you'll be signed in to Kindloop:",
    url,
    "",
    `The link works once and expires in ${mins} minute${mins === 1 ? "" : "s"}.`,
    "If you didn't ask for it, ignore this email.",
  ].join("\n");

  return { html, text };
}

/**
 * Deliver it, or explain why it couldn't be.
 *
 * Throws on a real send failure so Auth.js surfaces the error rather than telling
 * somebody to check an inbox nothing was sent to.
 */
export async function deliverMagicLink({ to, url, expires }: MagicLink): Promise<void> {
  const { html, text } = render({ url, expires });

  if (!hasMailer) {
    if (process.env.NODE_ENV === "production") {
      /* Never print a working credential to a production log, and never pretend
         to have sent something. */
      throw new Error(
        "No mail provider configured. Set AUTH_RESEND_KEY to send sign-in links."
      );
    }
    console.log(
      [
        "",
        "  ┌─ Kindloop sign-in link ──────────────────────────────────",
        `  │  to      ${to}`,
        `  │  expires in ${minutesUntil(expires)} min`,
        "  │",
        `  │  ${url}`,
        "  └──────────────────────────────────────────────────────────",
        "",
      ].join("\n")
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: "Your Kindloop sign-in link",
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Could not send the sign-in link (${res.status}). ${detail.slice(0, 200)}`);
  }
}
