/**
 * Personalized Website — the look.
 *
 * A website's theme dresses the parts this experience owns: the hero, the joins
 * between sections, and the ending. It deliberately does **not** reach inside the
 * sections themselves.
 *
 * That restraint is the point. Kindloop's governing rule is that two experiences
 * with their titles removed should look like different products — a theme that
 * repainted Love Letter and Treasure Hunt to match would erase the exact thing
 * that makes a website worth assembling. The story is a thread between rooms; it
 * does not repaint the rooms.
 *
 * Not a client module: the schema reads these ids on the server, and exports from
 * a `"use client"` file arrive there as reference proxies with nothing in them.
 */

export const WEBSITE_THEME_IDS = [
  "romantic",
  "proposal",
  "birthday",
  "distance",
  "family",
  "graduation",
  "friendship",
] as const;
export type WebsiteThemeId = (typeof WEBSITE_THEME_IDS)[number];

export interface WebsiteTheme {
  id: WebsiteThemeId;
  emoji: string;
  label: string;
  /** What this story tends to be, in one line, shown while choosing. */
  blurb: string;
  /** The ground the hero and the joins sit on. */
  bg: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentSoft: string;
  /** Suggested running order — a starting point, never enforced. */
  suggested: string[];
}

export const WEBSITE_THEMES: Record<WebsiteThemeId, WebsiteTheme> = {
  romantic: {
    id: "romantic",
    emoji: "❤️",
    label: "Romantic story",
    blurb: "Everything, from the beginning, in the order it happened.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #f7dcd6, #f1cfc8 46%, #e8bdb6 100%)",
    ink: "#4a2b28",
    inkSoft: "#7d5751",
    accent: "#b5502e",
    accentSoft: "rgba(181,80,46,.12)",
    suggested: ["memoryverse", "love-letter", "open-when", "countdown-gift"],
  },
  proposal: {
    id: "proposal",
    emoji: "💍",
    label: "Proposal",
    blurb: "A story that has been going somewhere the whole time.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #f3e6d2, #ecd9bd 46%, #e0c9a6 100%)",
    ink: "#3f2f1c",
    inkSoft: "#71583b",
    accent: "#a8763a",
    accentSoft: "rgba(168,118,58,.12)",
    suggested: ["memoryverse", "treasure-hunt", "memory-puzzle", "love-letter"],
  },
  birthday: {
    id: "birthday",
    emoji: "🎂",
    label: "Birthday",
    blurb: "A year of them, opened one thing at a time.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #fdeccb, #f9dfae 46%, #f2cf8e 100%)",
    ink: "#4a3718",
    inkSoft: "#7c6134",
    accent: "#c9822f",
    accentSoft: "rgba(201,130,47,.12)",
    suggested: ["countdown-gift", "surprise-reveal-box", "digital-scrapbook"],
  },
  distance: {
    id: "distance",
    emoji: "✈️",
    label: "Long distance",
    blurb: "For the stretch between now and seeing them.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #dfeaf2, #cddeeb 46%, #b9cfe0 100%)",
    ink: "#26384a",
    inkSoft: "#4f6680",
    accent: "#3f6f9c",
    accentSoft: "rgba(63,111,156,.12)",
    suggested: ["countdown-gift", "open-when", "memoryverse", "love-letter"],
  },
  family: {
    id: "family",
    emoji: "👨‍👩‍👧",
    label: "Family",
    blurb: "The people who were there first.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #f2ead6, #e9dec3 46%, #ddcfab 100%)",
    ink: "#3d3320",
    inkSoft: "#6d5e42",
    accent: "#8a6a34",
    accentSoft: "rgba(138,106,52,.12)",
    suggested: ["digital-scrapbook", "mothers-day-letter", "memoryverse"],
  },
  graduation: {
    id: "graduation",
    emoji: "🎓",
    label: "Graduation",
    blurb: "Everything it took, and the person at the end of it.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #e6e9f0, #d6dbe6 46%, #c3cad9 100%)",
    ink: "#2b3040",
    inkSoft: "#565e72",
    accent: "#5b6485",
    accentSoft: "rgba(91,100,133,.12)",
    suggested: ["memoryverse", "digital-scrapbook", "love-letter"],
  },
  friendship: {
    id: "friendship",
    emoji: "🤝",
    label: "Friendship",
    blurb: "The long, unglamorous, load-bearing kind.",
    bg: "radial-gradient(ellipse 70% 44% at 50% 0%, #e9f0e2, #dbe7d2 46%, #c9d9be 100%)",
    ink: "#2f3a28",
    inkSoft: "#5b6a51",
    accent: "#5f8047",
    accentSoft: "rgba(95,128,71,.12)",
    suggested: ["memoryverse", "win-you-back", "digital-scrapbook"],
  },
};

/** How the website opens, before the first section. */
export const INTRO_IDS = ["curtain", "fade", "typewriter", "none"] as const;
export type IntroId = (typeof INTRO_IDS)[number];

export const INTRO_LABELS: Record<IntroId, string> = {
  curtain: "Curtain lifts",
  fade: "Slow fade",
  typewriter: "Written out",
  none: "Straight in",
};
