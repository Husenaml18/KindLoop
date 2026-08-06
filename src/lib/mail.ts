import "server-only";
import nodemailer from "nodemailer";
import { formatCode } from "@/lib/verificationCode";

/**
 * Sending the sign-in link.
 *
 * Three ways out, picked in this order by what is configured:
 *
 *   1. SMTP      — `SMTP_HOST` is set. Any mailbox you already own: Google
 *                  Workspace, Zoho, Fastmail, Mailgun, your own server.
 *   2. Resend    — `AUTH_RESEND_KEY` is set. One `fetch`, no transport to keep
 *                  alive, which is why it was here first.
 *   3. The terminal — neither is set, and only outside production. The whole
 *                  product stays testable end to end before any mail account
 *                  exists, exactly like the mock checkout. It is *not* a
 *                  production fallback: `deliverMagicLink` throws there rather
 *                  than print a working credential into a log.
 */

export interface MagicLink {
  to: string;
  url: string;
  /** The same secret the link carries, in six characters somebody can type. */
  code: string;
  expires: Date;
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
/* Implicit TLS on 465, STARTTLS everywhere else. Set SMTP_SECURE to override a
   host that does something unusual. */
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;

export const hasSmtp = Boolean(SMTP_HOST);
export const hasResend = Boolean(process.env.AUTH_RESEND_KEY);
export const hasMailer = hasSmtp || hasResend;

const FROM = process.env.AUTH_EMAIL_FROM ?? "Kindloop <onboarding@resend.dev>";

/* One transport for the process. Nodemailer pools nothing by default, but
   rebuilding it per email re-does the DNS and TLS handshake every time. */
let transport: nodemailer.Transporter | undefined;
function smtp(): nodemailer.Transporter {
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth:
      process.env.SMTP_USER || process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });
  return transport;
}

/**
 * Prove the settings work without making somebody attempt a real sign-in to find
 * out. Returns the failure rather than throwing, so a settings screen can show it.
 */
export async function verifyMailer(): Promise<{ ok: boolean; via: string; error?: string }> {
  if (hasSmtp) {
    try {
      await smtp().verify();
      return { ok: true, via: `SMTP ${SMTP_HOST}:${SMTP_PORT}` };
    } catch (e) {
      return { ok: false, via: `SMTP ${SMTP_HOST}:${SMTP_PORT}`, error: String(e) };
    }
  }
  if (hasResend) return { ok: true, via: "Resend" };
  return { ok: false, via: "terminal (development only)", error: "No mail provider configured." };
}

function minutesUntil(when: Date): number {
  return Math.max(1, Math.round((when.getTime() - Date.now()) / 60000));
}

/**
 * The letter.
 *
 * Kindloop is a product made of paper, and the one piece of it that arrives in
 * somebody's inbox was a grey box with a black pill in it — nothing about it said
 * where it had come from, which for the *first* thing a new person sees is the
 * worst possible time to be anonymous.
 *
 * So: a cream sheet with a rule at the top, the code set large and spaced the way
 * a reference number is printed on a ticket, and the button underneath it rather
 * than instead of it. The code leads because it is the one that works when the
 * link is mangled by a corporate mail scanner, opened on a different device, or
 * rewritten into a tracking redirect nobody trusts.
 *
 * Everything is a table with inline styles and no web font. Outlook renders
 * through Word, Gmail strips `<style>` blocks, and half the clients in use ignore
 * flexbox entirely; a layout that only works in a browser is a layout most people
 * will never see. Georgia and Courier are the two faces that are actually
 * everywhere and read closest to the serif and the monospace on the site.
 */
function render({ url, code, expires }: { url: string; code: string; expires: Date }): {
  html: string;
  text: string;
} {
  const mins = minutesUntil(expires);
  const window = `${mins} minute${mins === 1 ? "" : "s"}`;
  const spaced = formatCode(code);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Kindloop sign-in code</title>
  </head>
  <body style="margin:0;padding:0;background:#e9dec6;">
    <!-- Shown in the inbox list beside the subject, then hidden. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your code is ${spaced} — it works once, for the next ${window}.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9dec6;">
      <tr>
        <td align="center" style="padding:34px 16px 40px;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:480px;background:#fdfaf1;border-radius:14px;border:1px solid #e0d2b6;">

            <!-- the band across the head of the sheet -->
            <tr><td style="height:5px;background:#8a3116;border-radius:14px 14px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>

            <tr>
              <td style="padding:32px 34px 0;font-family:Georgia,'Times New Roman',serif;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#8a7458;">
                  Kindloop
                </div>
                <h1 style="margin:16px 0 0;font-size:26px;line-height:1.2;font-weight:normal;color:#33240f;">
                  Here&rsquo;s your way in
                </h1>
                <p style="margin:12px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#584431;">
                  Type this code on the page you left open, or press the button
                  underneath it. Either one signs you in.
                </p>
              </td>
            </tr>

            <!-- the code, printed like a reference number on a ticket -->
            <tr>
              <td style="padding:26px 34px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="background:#f4ecdb;border:1px solid #e0d2b6;border-radius:10px;">
                  <tr>
                    <td align="center" style="padding:20px 16px 18px;">
                      <div style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:bold;letter-spacing:9px;color:#33240f;">
                        ${spaced}
                      </div>
                      <div style="margin-top:9px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6a5740;">
                        Works once &middot; expires in ${window}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:22px 34px 0;">
                <a href="${url}"
                   style="display:inline-block;padding:14px 30px;border-radius:10px;background:#3a2a18;color:#fdfaf1;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;">
                  Sign in to Kindloop
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 34px 0;">
                <div style="height:1px;background:#e6dac2;font-size:0;line-height:0;">&nbsp;</div>
                <p style="margin:18px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12.5px;line-height:1.65;color:#8a7458;">
                  If you didn&rsquo;t ask for this, nothing has happened and you can
                  ignore it &mdash; nobody can get in without the code.
                </p>
                <p style="margin:12px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.6;color:#a08f76;word-break:break-all;">
                  Button not working? Paste this in:<br />
                  <a href="${url}" style="color:#8a7458;">${url}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:26px 34px 30px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:#a08f76;">
                  Small gestures, kept.
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Here's your way in.",
    "",
    `Your code:  ${spaced}`,
    `It works once and expires in ${window}.`,
    "",
    "Or open this link and you'll be signed in:",
    url,
    "",
    "If you didn't ask for this, ignore it — nobody can get in without the code.",
    "",
    "Kindloop — small gestures, kept.",
  ].join("\n");

  return { html, text };
}

/**
 * Deliver it, or explain why it couldn't be.
 *
 * Throws on a real send failure so Auth.js surfaces the error rather than telling
 * somebody to check an inbox nothing was sent to.
 */
export async function deliverMagicLink({ to, url, code, expires }: MagicLink): Promise<void> {
  const { html, text } = render({ url, code, expires });

  if (!hasMailer) {
    if (process.env.NODE_ENV === "production") {
      /* Never print a working credential to a production log, and never pretend
         to have sent something. */
      throw new Error(
        "No mail provider configured. Set SMTP_HOST (or AUTH_RESEND_KEY) to send sign-in links."
      );
    }
    console.log(
      [
        "",
        "  ┌─ Kindloop sign-in link ──────────────────────────────────",
        `  │  to      ${to}`,
        `  │  code    ${formatCode(code)}`,
        `  │  expires in ${minutesUntil(expires)} min`,
        "  │",
        `  │  ${url}`,
        "  └──────────────────────────────────────────────────────────",
        "",
      ].join("\n")
    );
    return;
  }

  if (hasSmtp) {
    await smtp().sendMail({
      from: FROM,
      to,
      subject: `Your Kindloop code: ${formatCode(code)}`,
      html,
      text,
    });
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
      subject: `Your Kindloop code: ${formatCode(code)}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Could not send the sign-in link (${res.status}). ${detail.slice(0, 200)}`);
  }
}
