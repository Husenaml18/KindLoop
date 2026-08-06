import { winYouBackContentSchema, type WinYouBackContent } from "./schema";

/**
 * The public walkthrough.
 *
 * Written as one specific, small, unglamorous argument — a forgotten plan and a
 * defensive reply — rather than a generic apology. The whole claim of this
 * experience is that it can hold something true, and nothing proves that less than
 * sample copy about "what happened between us".
 *
 * Deliberately not a serious rupture. A demo of somebody apologising for something
 * grave would be uncomfortable to browse and would set the wrong expectation of
 * what this is for: it is for the ordinary ways people let each other down.
 */
export const winYouBackDemo: WinYouBackContent = winYouBackContentSchema.parse({
  mood: "rose",
  character: "bean",
  to: "Ana",
  from: "Sam",

  openingBroke: "I think I broke something…",
  openingFix: "…and I really want to fix it.",

  oopsLine: "I know. Not my finest moment.",
  oopsAdmission:
    "You told me about Thursday twice. I said “yeah, yeah” both times, and then I booked over it, and then — this is the bit I keep thinking about — when you were upset, I argued about whether you'd told me. Which you had. Twice.",

  replayIntro:
    "Here's what was actually going on in my head. It isn't an excuse. It's just the truth, and you deserve to know I've looked at it.",
  panels: [
    { id: "p1", bubble: "I'll remember. I always remember.", caption: "Reader: he did not remember.", doodle: "cloud" },
    { id: "p2", bubble: "It's fine, I'll sort it later.", caption: "The famous last words of this entire relationship.", doodle: "coffee" },
    { id: "p3", bubble: "Wait — did she say Thursday?", caption: "Realisation, arriving several days late.", doodle: "sparkle" },
    { id: "p4", bubble: "…I'll just explain it was a misunderstanding.", caption: "And here is where I made it worse.", doodle: "arrow" },
  ],

  regretIntro: "Open whichever of these you want. Ignore the rest — that's allowed.",
  regrets: [
    {
      id: "r1",
      label: "listened",
      body: "Not the “mm-hmm while looking at my phone” kind. You were telling me it mattered and I was already thinking about something else. If I'd put the phone down for ninety seconds none of the rest of this happens.",
    },
    {
      id: "r2",
      label: "said sorry first",
      body: "Before explaining. Before defending. I led with why I was right about a detail that didn't matter, and by the time I got to sorry it sounded like a technicality.",
    },
    {
      id: "r3",
      label: "trusted your memory over mine",
      body: "You are right about this sort of thing roughly always, and I know that, and I argued anyway. That wasn't about Thursday.",
    },
    {
      id: "r4",
      label: "called instead of texting",
      body: "Three paragraphs at 11pm was me wanting to feel better, not you. A phone call would have been harder for me, which is probably the point.",
    },
  ],

  missIntro: "None of this is an argument. It's just what's been on my mind.",
  keepsakes: [
    { id: "k1", kind: "note", caption: "The way you laugh at your own jokes before you finish them", tilt: -3 },
    { id: "k2", kind: "ticket", caption: "That terrible film", detail: "You said it was terrible after I did", tilt: 2 },
    { id: "k3", kind: "note", caption: "Sunday coffee, the one that takes four hours", tilt: 1.5 },
    { id: "k4", kind: "song", caption: "The song you put on in the kitchen", detail: "You know the one", tilt: -2 },
    { id: "k5", kind: "note", caption: "Arguing about where to eat for 40 minutes, then going to the same place", tilt: 2.5 },
    { id: "k6", kind: "note", caption: "You, telling me to text you when I got home", tilt: -1.5 },
  ],

  promiseIntro: "Turn these over. The back is the part that costs something.",
  promises: [
    {
      id: "pr1",
      text: "I'll say the thing instead of sitting on it",
      detail: "Same day. Even when it's awkward, especially when it's awkward, and not in a text at midnight.",
      doodle: "heart",
    },
    {
      id: "pr2",
      text: "I'll stop replying “K”",
      detail: "I know it reads as annoyed. It's usually me being lazy, which is somehow worse. Words now.",
      doodle: "sparkle",
    },
    {
      id: "pr3",
      text: "I'll ask before I assume",
      detail: "One question instead of a week of quietly deciding what you meant.",
      doodle: "star",
    },
    {
      id: "pr4",
      text: "I'll remember you haven't eaten",
      detail: "This is not a joke promise. You go quiet and I never notice until it's four o'clock.",
      doodle: "coffee",
    },
  ],

  letter:
    "I've written this about nine times and every version had a bit where I explained myself. I've taken all of them out.\n\nYou were right. I wasn't listening, and then I made it about who said what, because that was easier than sitting with having let you down. I'm sorry. Not the quick kind — the kind where I've actually thought about what it felt like to be on your side of it.\n\nI'm not asking for anything today. I'd just like the chance to be better at this, and I wanted you to know I noticed, properly, without being told twice.",
  letterSignoff: "Yours, still — and paying attention now",

  rating: true,
  asides: [
    { id: "a1", text: "I practised this 27 times." },
    { id: "a2", text: "I did briefly ask an AI for help. It was no use." },
    { id: "a3", text: "I deleted my ego for this." },
    { id: "a4", text: "There were three drafts. This is the least dramatic one." },
  ],

  cuteEnabled: true,
  cuteLabel: "Emergency cute mode",
  cute: [
    { id: "c1", kind: "joke", text: "Remember when I confidently gave directions to a street that does not exist?" },
    { id: "c2", kind: "joke", text: "You still have my good hoodie. I'm not asking for it back. I'm just noting it." },
    { id: "c3", kind: "joke", text: "The cat likes me now. I have receipts. This felt relevant." },
  ],

  closingLine: "If today isn't the day, I'll still be grateful you read this.",

  replyEnabled: true,
  replyTo: "",
});
