import { memoryverseContentSchema, type MemoryverseContent } from "./schema";

/**
 * The public walkthrough at /demo/memoryverse. Written as a real story rather
 * than lorem ipsum, because the whole point of the demo is to make someone feel
 * something — and it exercises every chapter type, including a hidden slide.
 *
 * Images are seeded placeholders so the demo works with no API key configured;
 * swap `demoImage` for real photography before launch.
 */
const demoImage = (seed: string) => `https://picsum.photos/seed/kindloop-demo-${seed}/1600/1100`;

export const memoryverseDemo: MemoryverseContent = memoryverseContentSchema.parse({
  title: "Our Story",
  subtitle: "Built with love by Sarah",
  createdOn: "Created on August 4, 2026",
  coverUrl: demoImage("cover"),
  introLines: ["Every memory has a story.", "This one is ours."],
  chapters: [
    {
      id: "d1",
      kind: "photo",
      title: "Our first coffee",
      date: "January 2024",
      location: "Ahmedabad",
      emotion: "nervous",
      imageUrl: demoImage("coffee"),
      description:
        "I still remember pretending I wasn't nervous.\nYou ordered the same thing as me and I decided that meant something.\nIt did.",
      reaction: "☕",
      transition: "rise",
    },
    {
      id: "d2",
      kind: "quote",
      quote: "You'd already made me laugh twice before I knew your last name.",
      attribution: "the walk home, that same night",
      date: "January 2024",
      transition: "fade",
    },
    {
      id: "d3",
      kind: "voice",
      title: "A voice I never want to forget",
      date: "March 2024",
      emotion: "home",
      imageUrl: demoImage("voice"),
      audioLabel: "Recorded on the drive back from the coast",
      description: "You were singing badly and you knew it.\nI kept the recording anyway.",
      transition: "fade",
    },
    {
      id: "d4",
      kind: "location",
      title: "The kitchen in Lisbon",
      date: "June 2024",
      travelFrom: "Ahmedabad",
      place: "Lisbon",
      emotion: "ours",
      description:
        "You burned the rice and we ate it anyway.\nWe still argue about whose fault it was.",
      reaction: "🍚",
      transition: "drift",
    },
    {
      id: "d5",
      kind: "timeline",
      title: "How we got here",
      emotion: "the long way",
      milestones: [
        { date: "Jan 2024", label: "One coffee, two nervous people" },
        { date: "Mar 2024", label: "The drive to the coast" },
        { date: "Jun 2024", label: "Lisbon, and the rice" },
        { date: "Nov 2024", label: "The tiny apartment with the loud radiator" },
        { date: "Aug 2026", label: "Here. Reading this." },
      ],
      description: "Two and a half years, in five lines.",
      transition: "rise",
    },
    {
      id: "d6",
      kind: "letter",
      title: "The one I never sent",
      date: "written last winter",
      emotion: "honest",
      letterBody:
        "I wrote this in December and never gave it to you.\n\nI wanted to tell you that the ordinary days are the ones I keep — the ones where nothing happens and you're just there, humming in the next room.\n\nI don't need the big moments. I already have the small ones.",
      signature: "— always, S",
      transition: "fade",
    },
    {
      id: "d7",
      kind: "photo",
      title: "The one I almost didn't include",
      date: "a Thursday",
      emotion: "just us",
      hidden: true,
      revealStyle: "hold",
      imageUrl: demoImage("hidden"),
      description:
        "Nothing happened this day.\nThat's exactly why I kept it.",
      reaction: "🤍",
      transition: "fade",
    },
    {
      id: "d8",
      kind: "countdown",
      title: "Our next adventure",
      emotion: "soon",
      imageUrl: demoImage("countdown"),
      targetDate: "2026-12-24T18:00",
      description: "One more slide for the tray. We just haven't taken the photo yet.",
      transition: "rise",
    },
  ],
  closingTitle: "The story doesn't end here.",
  closingSubtitle: "There are still memories waiting to happen.",
  closingCta: "Leave a message",
});
