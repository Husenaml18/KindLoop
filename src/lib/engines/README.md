# Kindloop engines

Experiences are not templates. A template implies one layout filled with different
content; every Kindloop experience is supposed to be its own object, and two of
them side by side with the titles removed should look like different products.

That only scales if the *craft* is shared and the *identity* is not. So the
craft lives here, in six engines, and each experience assembles itself from them.

```
src/lib/engines/
  scene/          intro beats, stage, transitions, loading veil, ambience
  paper/          paper stock, ink, sheets, folds, flaps, creases, torn edges
  envelope/       envelope bodies, linings, wax seals, the opening sequence
  gift/           box materials, wrapping, ribbons, lids, reveals, particles
  unlock/         dates, countdowns, passwords, moods, progress, the clock
  memory-block/   photo · voice · text · video · song · quote · map · artwork · date
```

## What belongs in an engine

A thing belongs here when it is **physics or vocabulary**, and stays in the
experience when it is **identity**.

| Engine | Owns | Never owns |
|---|---|---|
| Scene | that an intro has beats, is skippable, collapses under reduced motion | what the beats say |
| Paper | that paper hinges rather than slides | which paper, which ink |
| Envelope | how wax gives and a flap folds back | the envelope's colour or monogram |
| Gift | how a lid lifts and light comes out | what's in the box |
| Unlock | the arithmetic of waiting, and the clock | the words on a locked door |
| Memory Block | what a photo/voice/place *is* | how it's framed |

Colour, type, copy, pacing, iconography and layout stay with the experience.
Engine components take a skin or explicit tokens; none of them pick a colour.

## Two rules the engines exist to enforce

Both were bugs before they were rules.

**Paper hinges. It never slides.** An earlier envelope translated its letter
upward and rotated the flap a full 180°, and it read as a severed piece flying
out of a torn envelope. `paper.Fold` and `paper.Flap` are now the only way paper
opens: `rotateX` from a flattened `scaleY`, hinged at a named edge, and a flap
that stops at −150° while dropping behind the body at 0.42s with a lit lining.
Fixing it in one place fixed it in every experience.

**Never read the clock during render, and never set state synchronously in an
effect.** The first desynchronises hydration — the server and the browser
disagree about which doors are open. The second cascades a render before paint,
which React's lint rules reject. `unlock/clock.useClock()` does both correctly and
returns `0` until the time is known; callers treat `0` as "render the shut state".

Randomness is subject to the same discipline: `scene.seeded()` and
`scene.useScatter()` derive every star, mote and petal from a string, because
`Math.random()` during render produces a different sky on the server than in the
browser.

## Assembling an experience

A new experience is a folder under `src/lib/templates/<id>/` with:

```
theme.ts      its palette, fonts, materials — the identity
schema.ts     its content shape (zod, every field defaulted)
<parts>.tsx   whatever only it has
View.tsx      the recipient's experience, built from engines
Editor.tsx    the creator's side, with a live preview of View
demo.ts       sample content for the public /demo/<id> walkthrough
```

then one entry in `templates/registry.ts`, one in `templates/demos.ts`, and one
row in `templateCatalog.ts`. The landing page and the gallery read availability
straight from the catalog, so nothing has to be updated in two places.

Memory Puzzle is the reference build: its scene, unlock milestones, reward blocks
and keepsake box are all engine calls, and it still looks like nothing else here.
