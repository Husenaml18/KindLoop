/**
 * Two letters to stand for somebody.
 *
 * A header showing `husena.limdiwala@o2h.com` in full is both unreadable and a
 * quiet privacy leak — anyone glancing at the screen reads the address. Initials
 * say who is signed in without saying it out loud.
 *
 * A real name wins when there is one. Otherwise the email's local part is treated
 * as a name, since almost every address is built that way:
 * `husena.limdiwala` → HL, `ann_marie` → AM, `dev` → DE.
 */
export function initialsFor(name?: string | null, email?: string | null): string {
  const fromName = pick(name ?? "");
  if (fromName) return fromName;

  const local = (email ?? "").split("@")[0];
  const fromEmail = pick(local.replace(/[._\-+]+/g, " "));
  if (fromEmail) return fromEmail;

  return "··";
}

function pick(raw: string): string {
  /* Digits are dropped: "husena2024" should read HU, not H2. */
  const words = raw
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) {
    /* One word — take two letters of it so the badge stays balanced. */
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
