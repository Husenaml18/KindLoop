import { mothersDayContentSchema, type MothersDayContent } from "./schema";

/**
 * The public walkthrough.
 *
 * Written as a real letter rather than sample copy, because the one thing this
 * experience has to prove is that it can hold something true. A visitor who reads
 * placeholder text learns nothing about what it would feel like to receive.
 *
 * The ink is set slow. Somebody skimming a demo will find that too slow, and that
 * is the correct trade: this is not a page to skim.
 */
export const mothersDayLetterDemo: MothersDayContent = mothersDayContentSchema.parse({
  paper: "watercolourGarden",
  paperColour: "ivory",
  envelope: "floral",
  sealColour: "roseGold",
  sealSymbol: "flower",
  hand: "elegant",
  ink: "sepia",

  tag: "For Mom",
  writingSpeed: 130,
  dateLine: "Mother's Day",

  greeting: "Mom,",
  body:
    "I've started this letter about four times and thrown all of them away, which I think is your fault for being difficult to summarise.\n\nHere's what I keep coming back to. You never once made me feel like I was interrupting. Not when I was seven and wanted to show you a stone. Not when I was nineteen and rang at two in the morning from a phone box, reversing the charges, about something that turned out not to matter at all.\n\nI didn't notice that was unusual until I was much older and met people who had to book time with their parents.\n\nYou also fed everybody. Anyone I ever brought home got fed, whether they wanted it or not, and several of them still ask after you.",

  neverSaid:
    "I know the years when things were hard were harder than you let on, and I know now roughly what it cost you to keep that from us.\n\nI've never said thank you for that properly, because saying it out loud makes it real, and you'd have waved it off anyway. So it's going in writing where you can't.",

  closing: "All my love,",
  signature: "Your daughter",
  postscript: "The recipe was wrong. There's more butter in it than you admit to.",

  favouriteMemoryTitle: "The kitchen, and the radio on",
  favouriteMemoryStory:
    "You were peeling something and humming along badly to a song you claimed not to know. I was doing homework at the table and not doing it. Nothing happened that day at all, and it's the one I've kept.",
  favouriteMemoryPhoto:
    "https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&w=1000",

  lessons: [
    {
      id: "l-1",
      title: "How to apologise and mean it",
      body: "You never once made me say sorry when I didn't. You waited until I did.",
      motif: "hands",
    },
    {
      id: "l-2",
      title: "That a house is the people in it",
      body: "We moved four times. It was the same home every time, which took me years to work out.",
      motif: "house",
    },
    {
      id: "l-3",
      title: "To finish what I start",
      body: "Including this letter, which is on its fifth attempt.",
      motif: "thread",
    },
    {
      id: "l-4",
      title: "That kindness costs nothing",
      body: "You said it so often I stopped hearing it, and then started saying it myself.",
      motif: "flower",
    },
  ],

  thanks: [
    { id: "t-1", text: "Every lift you gave me that you pretended was on your way." },
    { id: "t-2", text: "Sitting up with me the whole week of my exams." },
    { id: "t-3", text: "Never telling me I was being dramatic, even when I was." },
    { id: "t-4", text: "Still asking whether I've eaten." },
    { id: "t-5", text: "The cardigan. I know how long it took." },
  ],

  polaroids: [
    {
      id: "p-1",
      url: "https://images.pexels.com/photos/1157395/pexels-photo-1157395.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: "you, pretending not to pose",
      afterParagraph: 1,
      tilt: -3,
    },
    {
      id: "p-2",
      url: "https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: "the garden you insisted was finished",
      afterParagraph: 3,
      tilt: 3,
    },
  ],

  decorations: [
    { id: "d-1", kind: "babysBreath", x: 6, y: 12, rotate: -14, scale: 1.1 },
    { id: "d-2", kind: "lavender", x: 94, y: 18, rotate: 12, scale: 1 },
    { id: "d-3", kind: "pressedFlower", x: 8, y: 86, rotate: 24, scale: 0.9 },
    { id: "d-4", kind: "stamp", x: 92, y: 8, rotate: 6, scale: 0.8 },
    { id: "d-5", kind: "doodle", x: 90, y: 88, rotate: -6, scale: 1.2 },
    { id: "d-6", kind: "rosePetal", x: 50, y: 3, rotate: 34, scale: 0.7 },
  ],

  voiceUrl: "",
  voiceLabel: "Press here",

  familyPhoto: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=1000",
  finalLine: "No matter how old I become, I'll always be your child.",

  ambience: true,
  garden: true,
});
