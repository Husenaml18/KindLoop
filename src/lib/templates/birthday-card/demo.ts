/**
 * Interactive Birthday Card — the sample card.
 *
 * Written so the walkthrough teaches the interaction without a word of
 * instruction: the cover says what to press, the envelope says what is in it, and
 * the cake says what to do with it. Somebody who lands on `/demo/birthday-card`
 * cold should reach the wish without ever being told how.
 *
 * Fictional throughout, and deliberately specific — "the good bakery on the
 * corner" is doing more work than "your special day" ever could. The whole
 * product is the difference between those two sentences.
 */
export const birthdayCardDemo = {
  theme: "ransom",

  recipient: "Mira",
  from: "Jonah",

  coverHeading: "Happy Birthday",
  coverMessage: "Made at the kitchen table, badly, on purpose.",
  coverPhotoUrl: "",
  decor: "stars",

  envelopeTeaser: "A little something for you…",
  letterHeading: "Twenty-nine looks well on you.",
  letterBody: `Mira,

I nearly bought you a card from the shop. It had a dog on it in sunglasses and it said "another year older" and I stood there holding it thinking: that is not a single true thing about her.

So this is the other kind. Made badly, at the kitchen table, with the good scissors I'm not supposed to use on paper.

Here is what I actually wanted to say. You had a hard year and you were kind through the whole of it, which is the harder trick and nobody hands out anything for it. I noticed. I'm still noticing.

There's cake on the next page. It's the one from the good bakery on the corner, the one you pretend not to want and then eat most of.

Blow the candles out properly. Take the breath. I'll wait.`,
  letterSignature: "— Jonah",
  letterPhotoUrl: "",

  cake: "layered",
  frosting: "strawberry",
  candleCount: 6,
  candleStyle: "striped",
  candleColors: [0, 1, 3],

  finalHeading: "Make a wish",
  finalMessage:
    "Whatever you just wished for — I hope it's something small and soon, rather than something enormous and far away.\n\nAnd if it was the cake, it's yours. All of it. I already had a slice standing up at the counter, so don't ask.",
  finalPhotoUrl: "",
  ctaLabel: "",
  ctaHref: "",
};
