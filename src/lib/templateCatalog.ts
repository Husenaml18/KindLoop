/**
 * The Kindloop experience catalog.
 *
 * People do not browse "templates" — they browse experiences built for a moment
 * they have in mind. So the catalog is organised by occasion, and every entry
 * records the real-world object it replaces plus the one interaction that makes
 * it unlike any other experience here. If two rows ever share an interaction,
 * one of them needs rethinking or merging.
 */

export type CategoryId =
  | "love"
  | "celebrations"
  | "family"
  | "milestones"
  | "adventures"
  | "presence"
  | "keepsakes"
  | "horizon";

export interface Category {
  id: CategoryId;
  emoji: string;
  label: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: "love", emoji: "❤️", label: "Love", blurb: "For the person you'd choose again." },
  { id: "celebrations", emoji: "🎉", label: "Celebrations", blurb: "For the days worth making noise about." },
  { id: "family", emoji: "👨‍👩‍👧", label: "Family", blurb: "For the people who were there first." },
  { id: "milestones", emoji: "💍", label: "Milestones", blurb: "For the moments that mark a before and after." },
  { id: "adventures", emoji: "🌍", label: "Adventures", blurb: "For everywhere you went together." },
  { id: "presence", emoji: "🎧", label: "Presence", blurb: "For when you can't be in the room." },
  { id: "keepsakes", emoji: "📖", label: "Keepsakes", blurb: "For things meant to be kept by hand." },
  { id: "horizon", emoji: "✦", label: "On the horizon", blurb: "Experiences we're still building." },
];

export interface CatalogTemplate {
  id: string;
  name: string;
  emoji: string;
  category: CategoryId;
  /** The feeling this is for. */
  theme: string;
  /** The physical object or ritual it replaces — the design brief in one line. */
  inspiration: string;
  /** The one interaction nothing else in the catalog does. */
  interaction: string;
  blurb: string;
  occasions: string[];
  recipients: string[];
  estimate: string;
  status: "available" | "soon" | "horizon";
  price: "Free" | "$5 once" | null;
  href: string;
  /** A public walkthrough exists at /demo/<id>. */
  demo?: boolean;
}

export const TEMPLATE_CATALOG: CatalogTemplate[] = [
  /* ---------------------------- love ---------------------------- */
  {
    id: "memoryverse",
    name: "Memoryverse",
    emoji: "📸",
    category: "love",
    theme: "Story journey",
    inspiration: "A carousel slide projector in a darkened room",
    interaction: "One memory fills the wall at a time, dipping to black between slides",
    blurb: "A darkened room and a projector. You talk them through one memory at a time.",
    occasions: ["Anniversary", "Birthday", "Long distance"],
    recipients: ["Partner", "Best friend", "Family"],
    estimate: "~20 min",
    status: "available",
    price: "Free",
    href: "/create/memoryverse",
    demo: true,
  },
  {
    id: "love-letter",
    name: "Love Letter",
    emoji: "💌",
    category: "love",
    theme: "Heartfelt expression",
    inspiration: "Handwritten stationery, sealed and posted",
    interaction: "Open the envelope, unfold the page, and the ink writes itself",
    blurb: "One long letter that arrives sealed and writes itself out as they read.",
    occasions: ["Anniversary", "Just because"],
    recipients: ["Partner"],
    estimate: "~10 min",
    status: "available",
    price: "Free",
    href: "/create/love-letter",
    demo: true,
  },
  {
    id: "open-when",
    name: "Open When",
    emoji: "✉️",
    category: "love",
    theme: "Emotional support",
    inspiration: "A shoebox of letters labelled for different days",
    interaction: "Letters unlock only by mood or date — \"open when you can't sleep\"",
    blurb: "A set of sealed letters, each one waiting for the day it's needed.",
    occasions: ["Long distance", "Comfort"],
    recipients: ["Partner", "Best friend"],
    estimate: "~20 min",
    status: "available",
    price: "Free",
    href: "/create/open-when",
    demo: true,
  },
  {
    id: "proposal-page",
    name: "Proposal Page",
    emoji: "💍",
    category: "love",
    theme: "The proposal story",
    inspiration: "A romantic storybook read aloud",
    interaction: "The whole story unfolds, and the last page is the question",
    blurb: "Everything that led here, told as a storybook that ends on one question.",
    occasions: ["Proposal"],
    recipients: ["Partner"],
    estimate: "~25 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "relationship-timeline",
    name: "Relationship Timeline",
    emoji: "🗓️",
    category: "love",
    theme: "Your journey together",
    inspiration: "An anniversary album with dates pencilled in",
    interaction: "A living timeline with a days-together counter that keeps ticking",
    blurb: "Every year side by side, with a counter that never stops running.",
    occasions: ["Anniversary"],
    recipients: ["Partner"],
    estimate: "~25 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "digital-rose",
    name: "Digital Rose",
    emoji: "🌹",
    category: "love",
    theme: "Small romantic gesture",
    inspiration: "A single eternal rose under glass",
    interaction: "One rose blooms in real time, and the message is inside the bloom",
    blurb: "One flower that never wilts, with something hidden in the petals.",
    occasions: ["Just because", "Anniversary"],
    recipients: ["Partner"],
    estimate: "~2 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* ------------------------ celebrations ------------------------ */
  {
    id: "birthday-surprise",
    name: "Birthday Surprise",
    emoji: "🎂",
    category: "celebrations",
    theme: "Celebration",
    inspiration: "Walking into a surprise party",
    interaction: "The gift opens, confetti drops, and the memories unfold behind it",
    blurb: "Confetti first, then everything the year was actually made of.",
    occasions: ["Birthday"],
    recipients: ["Partner", "Best friend", "Family"],
    estimate: "~10 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "surprise-reveal-box",
    name: "Surprise Reveal Box",
    emoji: "🎁",
    category: "celebrations",
    theme: "Mystery",
    inspiration: "Nested gift boxes, one inside the next",
    interaction: "Every lid has something small in the way of it — foil, a key, a three-digit lock",
    blurb:
      "A box inside a box inside a box. Ribbon off, whatever's in the way, then the lid — and again.",
    occasions: ["Birthday", "Anniversary", "Just because"],
    recipients: ["Friend", "Partner", "Family"],
    estimate: "~20 min",
    status: "available",
    price: "$5 once",
    href: "/create/surprise-reveal-box",
    demo: true,
  },
  {
    id: "countdown-gift",
    name: "Countdown Gift",
    emoji: "⏱️",
    category: "celebrations",
    theme: "Anticipation",
    inspiration: "An advent calendar on the kitchen wall",
    interaction: "One new door unlocks each day until the date arrives",
    blurb: "A door a day. They come back every morning until the day itself.",
    occasions: ["Wedding", "Birthday", "Christmas"],
    recipients: ["Partner", "Friend", "Family"],
    estimate: "~15 min",
    status: "available",
    price: "Free",
    href: "/create/countdown-gift",
    demo: true,
  },
  {
    id: "personalized-song",
    name: "Personalized Song",
    emoji: "🎵",
    category: "celebrations",
    theme: "Musical tribute",
    inspiration: "A vinyl record on a turntable",
    interaction: "The record spins while lyrics and memories surface in time",
    blurb: "A song written from your story, playing off a record that spins as they read.",
    occasions: ["Anniversary", "Birthday"],
    recipients: ["Partner", "Family"],
    estimate: "~5 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "personalized-ai-artwork",
    name: "AI Artwork",
    emoji: "🖼️",
    category: "celebrations",
    theme: "Artistic keepsake",
    inspiration: "A framed piece in a gallery, lit from above",
    interaction: "Their photo transforms into artwork as the frame is unveiled",
    blurb: "One photo, reimagined into something you couldn't have taken.",
    occasions: ["Just because", "Birthday"],
    recipients: ["Partner", "Friend"],
    estimate: "~5 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* --------------------------- family --------------------------- */
  {
    id: "mothers-day-letter",
    name: "Mother's Day Letter",
    emoji: "💝",
    category: "family",
    theme: "Gratitude",
    inspiration: "Good stationery, bought specially, written on slowly",
    interaction: "Watercolour flowers grow round the margins as she reads, one bloom per thank-you",
    blurb:
      "Said the way you'd actually say it to her, not the way a card would — with photos tucked between the paragraphs and your voice under the seal.",
    occasions: ["Mother's Day", "Her birthday", "Just because"],
    recipients: ["Mom", "Grandmother", "Whoever raised you"],
    estimate: "~25 min",
    status: "available",
    price: "Free",
    href: "/create/mothers-day-letter",
    demo: true,
  },
  {
    id: "baby-memory-book",
    name: "Baby Memory Book",
    emoji: "👶",
    category: "family",
    theme: "Growth",
    inspiration: "A baby album with the heights pencilled on the doorframe",
    interaction: "Milestones unfold along a timeline that visibly grows as you scroll",
    blurb: "First everything, gathered somewhere it won't get lost.",
    occasions: ["Baby shower", "Birthday"],
    recipients: ["Parents", "Family"],
    estimate: "~30 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "flowers",
    name: "Flowers",
    emoji: "💐",
    category: "family",
    theme: "Comfort and care",
    inspiration: "A bouquet left on the doorstep",
    interaction: "Tap each stem to read the note tucked into it",
    blurb: "A bouquet where every flower has something different to say.",
    occasions: ["Sympathy", "Just because", "Get well"],
    recipients: ["Family", "Friend", "Partner"],
    estimate: "~10 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* ------------------------- milestones ------------------------- */
  {
    id: "wedding-invite",
    name: "Wedding Invite",
    emoji: "👰",
    category: "milestones",
    theme: "Invitation, then memories",
    inspiration: "A luxury invitation suite, wax seal and all",
    interaction: "Collects RSVPs before the day, then becomes the album after it",
    blurb: "One link that invites them, then quietly turns into the album.",
    occasions: ["Wedding"],
    recipients: ["Everyone"],
    estimate: "~30 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "graduation-tribute",
    name: "Graduation Tribute",
    emoji: "🎓",
    category: "milestones",
    theme: "Achievement",
    inspiration: "A yearbook passed around for signatures",
    interaction: "Friends and family sign pages that fill up as more people add to it",
    blurb: "Everyone who got them here, signing the same book.",
    occasions: ["Graduation"],
    recipients: ["Friend", "Family", "Student"],
    estimate: "~20 min",
    status: "soon",
    price: null,
    href: "#",
  },
  {
    id: "memory-time-capsule",
    name: "Memory Time Capsule",
    emoji: "⏳",
    category: "milestones",
    theme: "Future memories",
    inspiration: "A tin buried in the garden with a date on the lid",
    interaction: "Sealed shut until the chosen date, then it opens on its own",
    blurb: "Locked now. Opens itself on the day you picked, whenever that is.",
    occasions: ["Anniversary", "Milestone", "New baby"],
    recipients: ["Partner", "Family", "Future you"],
    estimate: "~15 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* ------------------------- adventures ------------------------- */
  {
    id: "travel-journal",
    name: "Travel Journal",
    emoji: "✈️",
    category: "adventures",
    theme: "Adventure story",
    inspiration: "A stamped passport and a diary full of loose tickets",
    interaction: "Routes draw across a map as pages, stubs and postcards stack up",
    blurb: "Everywhere you went, with the tickets still tucked in the pages.",
    occasions: ["Trip", "Anniversary", "Honeymoon"],
    recipients: ["Partner", "Friend", "Family"],
    estimate: "~30 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* -------------------------- presence -------------------------- */
  {
    id: "voice-memory",
    name: "Voice Memory",
    emoji: "🎙️",
    category: "presence",
    theme: "Presence",
    inspiration: "A cassette tape recorded for one person",
    interaction: "Your voice leads, and photos appear in time with what you're saying",
    blurb: "You narrate. The photos follow your voice, not their scroll.",
    occasions: ["Long distance", "Birthday", "Comfort"],
    recipients: ["Partner", "Family", "Friend"],
    estimate: "~15 min",
    status: "soon",
    price: null,
    href: "#",
  },

  /* -------------------------- keepsakes ------------------------- */
  {
    id: "digital-scrapbook",
    name: "Digital Scrapbook",
    emoji: "📖",
    category: "keepsakes",
    theme: "Handmade memories",
    inspiration: "A physical scrapbook, taped and glued by hand",
    interaction: "Pages turn with weight, and things are hidden in the pockets",
    blurb: "Photos taped in, notes in the margins, pages that actually turn.",
    occasions: ["Graduation", "Farewell", "Parents"],
    recipients: ["Parent", "Friend", "Colleague"],
    estimate: "~40 min",
    status: "available",
    price: "$5 once",
    href: "/create/digital-scrapbook",
    demo: true,
  },

  /* -------------------------- horizon --------------------------- */
  {
    id: "star-map",
    name: "Star Map",
    emoji: "⭐",
    category: "horizon",
    theme: "Where it happened",
    inspiration: "The night sky above a specific place and date",
    interaction: "Each star is a memory, placed where in the world it happened",
    blurb: "A night sky where every star is somewhere you've been together.",
    occasions: ["Anniversary", "Wedding"],
    recipients: ["Partner"],
    estimate: "~20 min",
    status: "horizon",
    price: null,
    href: "#",
  },
  {
    id: "storybook",
    name: "Storybook",
    emoji: "🎬",
    category: "horizon",
    theme: "Your story, illustrated",
    inspiration: "An illustrated fairy tale read at bedtime",
    interaction: "Your memories become illustrated chapters with narration",
    blurb: "Your years together, retold as a fairy tale with pictures.",
    occasions: ["Anniversary", "Birthday"],
    recipients: ["Partner", "Child"],
    estimate: "~30 min",
    status: "horizon",
    price: null,
    href: "#",
  },
  {
    id: "memory-puzzle",
    name: "Memory Puzzle",
    emoji: "🧩",
    category: "keepsakes",
    theme: "Earn the reveal",
    inspiration: "A wooden jigsaw tipped onto the dining table",
    interaction: "Every quarter of the puzzle they finish unlocks another piece of the story",
    blurb:
      "They have to put it together before they can see it — and something unlocks at 25, 50 and 75 per cent on the way.",
    occasions: ["Birthday", "Anniversary", "Just because"],
    recipients: ["Friend", "Partner", "Child", "Family"],
    estimate: "~20 min",
    status: "available",
    price: "$5 once",
    href: "/create/memory-puzzle",
    demo: true,
  },
  {
    id: "treasure-hunt",
    name: "Treasure Hunt",
    emoji: "🗝️",
    category: "adventures",
    theme: "The chase",
    inspiration: "A hand-drawn map with a route across it and an X at the end",
    interaction: "A route of stops on a map that draws itself, each one a different kind of clue",
    blurb:
      "Follow the map. Twelve kinds of clue, a memory pinned at every stop, and a chest at the end of it.",
    occasions: ["Birthday", "Proposal", "Anniversary", "Christmas"],
    recipients: ["Partner", "Friend", "Child", "Family"],
    estimate: "~30 min",
    status: "available",
    price: "$5 once",
    href: "/create/treasure-hunt",
    demo: true,
  },
  {
    id: "family-legacy",
    name: "Family Legacy",
    emoji: "👨‍👩‍👧",
    category: "horizon",
    theme: "What gets passed down",
    inspiration: "A family tree drawn in the front of a bible",
    interaction: "An interactive tree holding stories, recipes and recorded voices",
    blurb: "The stories, the recipes, and the voices — kept where they won't be lost.",
    occasions: ["Reunion", "Milestone", "Remembrance"],
    recipients: ["Family"],
    estimate: "~45 min",
    status: "horizon",
    price: null,
    href: "#",
  },
  {
    id: "pet-tribute",
    name: "Pet Tribute",
    emoji: "🐾",
    category: "horizon",
    theme: "A good one",
    inspiration: "A collar and a photo kept on the shelf",
    interaction: "Their whole life laid out in milestones, paw prints and favourite spots",
    blurb: "For the one who met you at the door every single time.",
    occasions: ["Remembrance", "Adoption day"],
    recipients: ["Family", "Partner", "Yourself"],
    estimate: "~20 min",
    status: "horizon",
    price: null,
    href: "#",
  },
  {
    id: "memorial-garden",
    name: "Memorial Garden",
    emoji: "🕊️",
    category: "horizon",
    theme: "Somewhere to sit with it",
    inspiration: "A quiet garden with a bench and a candle",
    interaction: "Visitors light a candle, leave flowers, and add their own memory",
    blurb: "A quiet place anyone who loved them can visit and add to.",
    occasions: ["Remembrance"],
    recipients: ["Family", "Friends"],
    estimate: "~25 min",
    status: "horizon",
    price: null,
    href: "#",
  },
];

export function uniqueOccasions(): string[] {
  return Array.from(new Set(TEMPLATE_CATALOG.flatMap((t) => t.occasions))).sort();
}

export function uniqueRecipients(): string[] {
  return Array.from(new Set(TEMPLATE_CATALOG.flatMap((t) => t.recipients))).sort();
}
