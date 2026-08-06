/**
 * The code that comes in the email.
 *
 * It is the same secret the link carries — Auth.js stores exactly one token per
 * address, so rather than inventing a second one and a second table to keep it in,
 * the token *is* the code. Click the button or type the six characters and the
 * identical row is spent either way.
 *
 * Six characters from a thirty-one letter alphabet is about 887 million
 * possibilities, single-use, expiring in fifteen minutes. The alphabet has no
 * `0`/`O`, `1`/`I`/`L` or `5`/`S` in it, because the failure mode of a code is not
 * somebody guessing it — it is somebody reading it off a phone screen and typing
 * the wrong character.
 *
 * Worth being clear about what this does not do: there is no attempt limiting on
 * the callback yet. At this scale that is an acceptable gap and a deliberate one,
 * not an oversight — before this is public it wants a per-address throttle, which
 * belongs in the route handler rather than here.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRTUVWXYZ";
export const CODE_LENGTH = 6;

export function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    /* Modulo bias over 256/30 is immaterial next to a fifteen-minute window and
       a single use, and rejection sampling here would buy nothing real. */
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * What somebody typed, turned into what was issued.
 *
 * Upper-cased and stripped of the spaces and dashes people add when copying, and
 * nothing else. Folding lookalikes onto each other — `O` to `Q`, `1` to `J` —
 * is tempting and wrong: the mappings are guesses, and a wrong guess turns a
 * correctly-typed code into a rejected one. The alphabet already leaves the
 * confusable glyphs out, which is the real fix.
 */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, CODE_LENGTH);
}

/** Split for display: `K4M9XP` reads as `K4M 9XP`. */
export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}
