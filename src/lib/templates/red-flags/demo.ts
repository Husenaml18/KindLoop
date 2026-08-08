/**
 * My Red Flags — the sample journal.
 *
 * Written to demonstrate the one distinction the whole experience rests on: every
 * flag here is followed by work, and none of them asks to be forgiven. Read the
 * chapters back with the "what I'm doing about it" blocks removed and you get an
 * apology; with them in, you get somebody who has thought about themselves. That
 * gap is the product.
 *
 * The unticked boxes are deliberate and are the most important detail in the
 * file. A demo where every step is done would be a person advertising that
 * they're fixed, which is both less honest and less moving than one who has got
 * three of four.
 */
export const redFlagsDemo = {
  notebook: "vintage",

  recipient: "Priya",
  from: "Dev",
  coverTitle: "My Red Flags 🚩",
  coverSubtitle: "The ones I'm working on.",
  coverNote: "Nobody comes with a user manual.\nThis is mine.",

  flags: [
    {
      id: "rf1",
      title: "I overthink texts.",
      explain:
        "When you take longer than usual to reply, my brain writes ten fake stories before reality arrives. By the time you answer I've already had an entire argument with a version of you that doesn't exist.",
      origin: "I think I've always been a bit scared of being forgotten.",
      steps: [
        { id: "rf1s1", text: "Pause before assuming", done: true },
        { id: "rf1s2", text: "Ask you directly instead of guessing", done: true },
        { id: "rf1s3", text: "Stop rereading messages looking for a tone", done: false },
        { id: "rf1s4", text: "Trust more", done: false },
      ],
      win: "You were quiet all Thursday and I didn't spiral. I made dinner and waited.",
      winWhen: "last month",
      need: "If I've gone quiet and gone strange, just tell me the truth instead of guessing what I need to hear.",
      attachment: { kind: "none", url: "", caption: "" },
    },
    {
      id: "rf2",
      title: "I get defensive too quickly.",
      explain:
        "You say one thing about the washing up and somewhere between your mouth and my ears it turns into a case against my whole character. Then I argue with the case instead of the washing up.",
      origin:
        "Growing up, being wrong about something small usually turned into being wrong as a person. I learned to defend the whole building over one window.",
      steps: [
        { id: "rf2s1", text: "Let you finish the sentence", done: true },
        { id: "rf2s2", text: "Say \"give me a minute\" instead of firing back", done: true },
        { id: "rf2s3", text: "Ask what you meant before deciding what you meant", done: false },
      ],
      win: "You mentioned the thing about my mum and I said \"okay, that's fair\" out loud. First time.",
      winWhen: "two weeks ago",
      need: "Start with the thing itself, not with \"we need to talk\". I know that's a big ask. I'm meeting you halfway on it.",
      attachment: { kind: "none", url: "", caption: "" },
    },
    {
      id: "rf3",
      title: "I shut down when I'm overwhelmed.",
      explain:
        "I don't storm off. I do something worse — I stay in the room and go completely flat, and then you're sitting next to somebody who isn't there.",
      origin: "",
      steps: [
        { id: "rf3s1", text: "Name it out loud: \"I'm overwhelmed, not annoyed\"", done: true },
        { id: "rf3s2", text: "Say how long I need rather than disappearing into it", done: false },
        { id: "rf3s3", text: "Come back and finish the conversation the same day", done: false },
      ],
      win: "I said \"I need twenty minutes\" instead of going grey for a whole evening.",
      winWhen: "on Sunday",
      need: "Don't chase me into it. Twenty minutes and I'll come back — and hold me to coming back.",
      attachment: { kind: "none", url: "", caption: "" },
    },
    {
      id: "rf4",
      title: "I expect you to read my mind.",
      explain:
        "I decide what I need, tell nobody, and then quietly keep score of whether you guessed. It's an unwinnable game and I set it up.",
      origin: "Asking for things out loud has always felt like admitting I need them.",
      steps: [
        { id: "rf4s1", text: "Say the thing on the day, not three days later", done: true },
        { id: "rf4s2", text: "Stop scoring", done: false },
      ],
      win: "I asked you to come with me to the appointment instead of hoping you'd offer.",
      winWhen: "in March",
      need: "When I go vague and say \"it's fine\" — it isn't, and you're allowed to say so.",
      attachment: { kind: "none", url: "", caption: "" },
    },
  ],

  promiseTitle: "I don't expect to become perfect.",
  promiseNote: "I just don't want to stay the same.",
  goals: [
    { id: "g1", when: "This month", text: "Say the thing on the day I notice it" },
    { id: "g2", when: "This year", text: "Get through one whole disagreement without defending the building" },
    { id: "g3", when: "Ongoing", text: "Keep writing this list, and keep it honest" },
  ],

  endingNote: "The goal isn't to hide your flaws.\nIt's to outgrow them.",
};
