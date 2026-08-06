import { isValidElement, type ReactNode } from "react";

/**
 * Every question, in one place.
 *
 * The landing page shows the first handful and links here; the FAQ page shows all
 * of them, grouped. One list, so the two can never disagree — the answer to "what
 * does it cost" drifting between two files is exactly the kind of thing nobody
 * notices until a customer does.
 */

export interface Faq {
  q: string;
  a: ReactNode;
  /** Which group it belongs to on the full page. */
  group: FaqGroup;
  /** Shown on the landing page. Five of them, in this order. */
  featured?: number;
}

export type FaqGroup = "Getting started" | "Privacy" | "Money" | "Making one" | "Afterwards";

export const FAQ_GROUPS: FaqGroup[] = [
  "Getting started",
  "Privacy",
  "Money",
  "Making one",
  "Afterwards",
];

export const FAQS: Faq[] = [
  {
    group: "Getting started",
    featured: 1,
    q: "Does the person I send it to need an account?",
    a: (
      <>
        No — and they never will. A gift is a private link that opens in any browser,
        on any phone or laptop. No app, no sign-up, nothing to install. You&apos;re the
        only one who ever signs in.
      </>
    ),
  },
  {
    group: "Privacy",
    featured: 2,
    q: "Who else can see what I make?",
    a: (
      <>
        Only whoever you send the link to. Nothing is listed, indexed or shared
        anywhere, and there is no feed or public profile other people can browse.
        There is deliberately no admin panel that can read your letters either.
      </>
    ),
  },
  {
    group: "Money",
    featured: 3,
    q: "What does it cost?",
    a: (
      <>
        Most experiences are free, with no limit on how many you make. A few of the
        larger ones are five dollars once — for that gift, not a subscription. You
        will never be charged again for something you have already made.
      </>
    ),
  },
  {
    group: "Making one",
    featured: 4,
    q: "How long does one take to make?",
    a: (
      <>
        A letter takes about ten minutes. The bigger ones — a treasure hunt, a
        countdown, a puzzle — take half an hour or so, because you&apos;re writing
        more. You can save and come back; nothing is lost between visits.
      </>
    ),
  },
  {
    group: "Afterwards",
    featured: 5,
    q: "Can I change it after I've sent the link?",
    a: (
      <>
        Yes. The link stays the same and always shows the current version, so you can
        fix a typo after sending without having to send anything again.
      </>
    ),
  },

  /* ---------- the rest, on the FAQ page only ---------- */

  {
    group: "Getting started",
    q: "Do I need an account?",
    a: (
      <>
        To make something, yes — otherwise there&apos;d be no way to come back and
        edit it, or to stop somebody else editing yours. There&apos;s no password to
        invent: we email you a link and opening it signs you in.
      </>
    ),
  },
  {
    group: "Getting started",
    q: "What can go inside one?",
    a: (
      <>
        Photographs, your own handwriting, voice recordings, video, songs, places on a
        map, quotes and dates. Which of those apply depends on the experience — a
        letter wants words, a scrapbook wants photographs.
      </>
    ),
  },
  {
    group: "Getting started",
    q: "Is it really handmade, or is it templates?",
    a: (
      <>
        Each one is its own thing: its own paper, its own way of opening, its own
        pacing. A letter arrives a word at a time in your handwriting; a treasure
        hunt has to be walked clue by clue; a puzzle gives a memory back a quarter
        at a time. That is why they are built one at a time, and why there
        aren&apos;t fifty of them.
      </>
    ),
  },
  {
    group: "Privacy",
    q: "Can somebody guess the link?",
    a: (
      <>
        Each link ends in a random string, not a number that counts upwards, so there
        is nothing to guess your way through. If you&apos;d rather a gift stopped
        existing, deleting it takes the link with it.
      </>
    ),
  },
  {
    group: "Privacy",
    q: "Do you read what I write?",
    a: (
      <>
        No. There is no interface anywhere in the product for reading somebody
        else&apos;s gift — not for staff, not for anyone. That&apos;s a design
        decision, not a policy we ask you to take on trust.
      </>
    ),
  },
  {
    group: "Money",
    q: "Is it a subscription?",
    a: (
      <>
        No. The paid experiences are a one-off charge for that gift. Nothing renews,
        and nothing you&apos;ve already made can stop working because you didn&apos;t
        pay again.
      </>
    ),
  },
  {
    group: "Money",
    q: "What happens if I don't pay for a paid one?",
    a: (
      <>
        You can build the whole thing and see exactly how it looks first. It simply
        won&apos;t open for the person you send it to until it&apos;s unlocked, so you
        never pay for something before knowing whether it&apos;s any good.
      </>
    ),
  },
  {
    group: "Making one",
    q: "Can I use it on my phone?",
    a: (
      <>
        Opening one, absolutely — that&apos;s the common case, and every experience is
        built for it. Making one works on a phone too, though the bigger ones are
        easier on a larger screen simply because there&apos;s more to arrange.
      </>
    ),
  },
  {
    group: "Making one",
    q: "My photos are enormous. Is that a problem?",
    a: (
      <>
        No. Photographs are resized in your browser before they&apos;re uploaded, so a
        twelve-megapixel phone picture becomes something sensible on the way. You
        don&apos;t have to think about it.
      </>
    ),
  },
  {
    group: "Afterwards",
    q: "Can I delete it?",
    a: (
      <>
        At any time, from your profile — the gift, its photographs and recordings, and
        the link itself. Deleting your whole account removes everything with it,
        including the uploaded files. We keep no copy.
      </>
    ),
  },
  {
    group: "Afterwards",
    q: "How long does a gift stay up?",
    a: (
      <>
        For as long as you want it to. Nothing expires on its own and nothing is
        deleted for being old. It stops existing when you decide it should.
      </>
    ),
  },
];

/** The five the landing page shows, in the order they were chosen. */
export const FEATURED_FAQS = FAQS.filter((f) => f.featured).sort(
  (a, b) => (a.featured ?? 0) - (b.featured ?? 0)
);

/**
 * The words in an answer, as plain text.
 *
 * Answers are written as JSX so they can carry emphasis and entities, which makes
 * them unsearchable as they stand. This walks the tree once and hands back
 * something a search box can match against, rather than asking every answer to be
 * written twice.
 */
export function faqText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(faqText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return faqText(node.props.children);
  return "";
}

/** Everything about one question that a search should look at. */
export function faqHaystack(f: Faq): string {
  return `${f.q} ${faqText(f.a)} ${f.group}`.toLowerCase();
}
