"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getSectionTemplate as getTemplate } from "@/lib/templates/sections";
import { WEBSITE_THEMES } from "./theme";
import { SectionShell } from "./SectionShell";
import type { PersonalizedWebsiteContent, WebsiteSection } from "./schema";

/**
 * Personalized Website — the recipient's view.
 *
 * This renders a hero, then every section in order, then an ending. That is the
 * entire component. Each section is looked up in the registry and drawn with its
 * own `View` — the same component that serves it as a standalone gift, given the
 * same content, with `embedded` set.
 *
 * Nothing here knows what a Love Letter is. Adding an eleventh experience to
 * Kindloop makes it available as a section with no changes to this file.
 *
 * Two rules it holds to:
 *
 * A section whose content will not parse renders that template's `emptyContent`
 * rather than throwing. One malformed section must not take down somebody's
 * whole website on the day they send it.
 *
 * A locked section renders nothing at all. Publishing is refused while one
 * exists, so in practice a recipient never meets one — but if a row somehow
 * reaches here unpaid, the honest behaviour is silence rather than a placeholder
 * advertising what they are not being shown.
 *
 * `showLocked` flips that, and only the editor's own preview passes it. There,
 * silence would read as a bug — you added a section and nothing appeared — so a
 * locked section draws a plate in its place. It is the one caller that has any
 * business seeing what has not been paid for.
 */
export function PersonalizedWebsiteView({
  content,
  embedded = false,
  showLocked = false,
}: {
  content: PersonalizedWebsiteContent;
  embedded?: boolean;
  /** Editor preview only — draws locked sections as a placeholder plate. */
  showLocked?: boolean;
}) {
  const theme = WEBSITE_THEMES[content.theme] ?? WEBSITE_THEMES.romantic;
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(embedded || content.intro === "none");

  const sections = useMemo(
    () => content.sections.filter((s) => (showLocked || !s.locked) && getTemplate(s.type)),
    [content.sections, showLocked]
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: embedded ? "100%" : "100dvh",
        background: theme.bg,
        color: theme.inkSoft,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      {/* ---------- the hero ---------- */}
      <header
        style={{
          position: "relative",
          /*
           * Deliberately short of a full screen.
           *
           * At `100dvh` the opening was exactly one viewport of centred text and
           * nothing else — you scrolled expecting the story and got the bottom of
           * the same empty screen. Stopping at 86% leaves a band of the first
           * section showing under the fold, which is the oldest and plainest way
           * to say "there is more, keep going". The cap stops it stretching into
           * a desert on a tall monitor.
           */
          minHeight: embedded ? 380 : "min(86dvh, 760px)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "48px 24px",
          overflow: "hidden",
        }}
      >
        {content.heroImageUrl && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `center/cover url(${content.heroImageUrl})`,
              opacity: 0.34,
            }}
          />
        )}

        <motion.div
          style={{ position: "relative", maxWidth: 720 }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {content.recipient && (
            <p
              className="m-0"
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 10,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: theme.accent,
              }}
            >
              For {content.recipient}
            </p>
          )}

          <h1
            className="m-0 mt-4"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 500,
              fontSize: "clamp(34px,6vw,68px)",
              lineHeight: 1.03,
              letterSpacing: "-0.018em",
              color: theme.ink,
              textWrap: "balance",
            }}
          >
            {content.title || "Our story"}
          </h1>

          {content.subtitle && (
            <p
              className="m-0 mt-5"
              style={{ maxWidth: 520, marginInline: "auto", fontSize: 17, lineHeight: 1.7, color: theme.inkSoft }}
            >
              {content.subtitle}
            </p>
          )}

          {!started && (
            <button
              type="button"
              onClick={() => setStarted(true)}
              style={{
                marginTop: 34,
                height: 50,
                padding: "0 30px",
                borderRadius: 999,
                border: "none",
                background: theme.accent,
                color: "#fff",
                fontFamily: "inherit",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Begin
            </button>
          )}
        </motion.div>
      </header>

      {/* ---------- the story ---------- */}
      {started &&
        sections.map((section) => (
          <SectionJoin key={section.id} section={section} theme={theme} />
        ))}

      {/* ---------- the ending ---------- */}
      {started && (content.endingTitle || content.endingNote) && (
        <footer
          style={{
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: "110px 24px 120px",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            {content.endingTitle && (
              <h2
                className="m-0"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontWeight: 500,
                  fontSize: "clamp(26px,3.6vw,42px)",
                  lineHeight: 1.1,
                  color: theme.ink,
                }}
              >
                {content.endingTitle}
              </h2>
            )}
            {content.endingNote && (
              <p className="m-0 mt-4" style={{ fontSize: 16, lineHeight: 1.75, color: theme.inkSoft }}>
                {content.endingNote}
              </p>
            )}
            {content.from && (
              <p
                className="m-0 mt-7"
                style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 21, color: theme.accent }}
              >
                — {content.from}
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

/**
 * One section.
 *
 * There used to be a 92px gradient seam above each of these, on the theory that
 * two experiences with different grounds butting together would read as a
 * rendering fault. In practice it read as a gap — a flat band of the website's
 * background wedged between two finished scenes, three times over. Cutting
 * straight from one to the next is what a real site does, and now that each
 * section fills its shell the cut is clean.
 */
function SectionJoin({
  section,
  theme,
}: {
  section: WebsiteSection;
  theme: (typeof WEBSITE_THEMES)[keyof typeof WEBSITE_THEMES];
}) {
  const def = getTemplate(section.type);
  if (!def) return null;

  /* Parsed with the template's own schema, here rather than in the website's —
     one place, the authoritative one, and a failure costs one section instead of
     the page. */
  const parsed = def.contentSchema.safeParse(section.content ?? def.emptyContent);
  const content = parsed.success ? parsed.data : def.emptyContent;

  return (
    <SectionShell>
      {section.locked ? (
        <LockedPlate name={def.displayName} theme={theme} />
      ) : (
        <def.View content={content} embedded />
      )}
    </SectionShell>
  );
}

/**
 * What stands in for a section that has not been paid for.
 *
 * Only ever drawn in the editor's own preview. The tone is deliberate: this is a
 * place already reserved in the story, not a wall. Nothing here says "denied" —
 * it says the section is here, it is theirs to arrange and fill in, and it goes
 * live when the website does.
 */
function LockedPlate({
  name,
  theme,
}: {
  name: string;
  theme: (typeof WEBSITE_THEMES)[keyof typeof WEBSITE_THEMES];
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: 32,
        background: theme.accentSoft,
      }}
    >
      <div style={{ maxWidth: 340 }}>
        <div style={{ fontSize: 30, lineHeight: 1, opacity: 0.5 }}>🔒</div>
        <h3
          className="m-0 mt-4"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            fontSize: 24,
            color: theme.ink,
          }}
        >
          {name}
        </h3>
        <p className="m-0 mt-2.5" style={{ fontSize: 14, lineHeight: 1.65, color: theme.inkSoft }}>
          Its place in the story is held. Fill it in now — it opens for them the
          moment you publish.
        </p>
      </div>
    </div>
  );
}
