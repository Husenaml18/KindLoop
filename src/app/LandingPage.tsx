"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "./fonts";
import { FountainPenCursor } from "./FountainPenCursor";
import { cssStyle, photoStyle } from "@/lib/uiStyle";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { HeroStage, AssembledMemories, useEnvelopeSequence } from "./HeroStory";
import styles from "./landing.module.css";
import theme from "./theme.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FaqSection } from "./FaqSection";
import { MemoryOrbit } from "./MemoryOrbit";

const GRAIN_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 60,
  opacity: 0.4,
  mixBlendMode: "multiply",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='.35'/></svg>\")",
};

/*
 * The paper wash, fixed so it stays put while the page scrolls over it.
 *
 * It sits *behind* everything (`z-index: -1`), and that is not a detail: its last
 * layer is a plain opaque gradient, so on any positive z-index this is a solid
 * sheet of page-coloured paint covering the whole viewport. That is exactly what
 * happened — every word on the landing page was still in the DOM, correctly sized
 * and coloured, with this painted flat on top of it.
 */
const VIGNETTE_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: -1,
  background:
    "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
          "radial-gradient(circle at 72% 64%, rgba(122,92,52,.055) .6px, transparent .9px), " +
          "radial-gradient(ellipse 92% 48% at 50% -6%, rgba(226,186,124,.34), transparent 62%), " +
          "radial-gradient(ellipse 60% 38% at 92% 22%, rgba(190,104,64,.12), transparent 66%), " +
          "linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 32%, var(--bg1) 66%, var(--bg0) 100%)",
  backgroundSize: "39px 43px, 57px 51px, auto, auto, auto",
};

function CoffeeRing({
  size,
  style,
  faint,
}: {
  size: number;
  style?: CSSProperties;
  faint?: boolean;
}) {
  const strength = faint ? 0.6 : 1;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        pointerEvents: "none",
        mixBlendMode: "multiply",
        background: `radial-gradient(circle, transparent 53%, rgba(107,74,49,${0.16 * strength}) 58%, rgba(90,58,36,${0.3 * strength}) 62%, rgba(107,74,49,${0.13 * strength}) 67%, transparent 71%)`,
        ...style,
      }}
    />
  );
}

function InkSplatter({ style }: { style?: CSSProperties }) {
  const dots = [
    { dx: 0, dy: 0, r: 5 },
    { dx: 10, dy: -3, r: 2.5 },
    { dx: -8, dy: 6, r: 1.8 },
    { dx: 16, dy: 5, r: 1.4 },
  ];
  return (
    <div aria-hidden style={{ position: "absolute", width: 1, height: 1, pointerEvents: "none", ...style }}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.dx,
            top: d.dy,
            width: d.r * 2,
            height: d.r * 2,
            marginLeft: -d.r,
            marginTop: -d.r,
            borderRadius: "50%",
            background: "#232a3d",
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

/*
 * Everything on this page arriving as it is reached.
 *
 * The same language as the Templates cards: out of focus and a little low, then
 * sharp and settled. Blur rather than a bare fade because the page is a desk full
 * of photographs, and a photograph arriving is one coming into focus.
 *
 * Two things this is careful about, both of which it used to get wrong.
 *
 * Nothing ever *snaps*. The old backstop stripped `opacity`, `transform` and
 * `transition` off in one go, which teleported the element from twenty-four pixels
 * low straight into place with no animation at all — and because it ran on a timer,
 * it did that to the whole page below the fold about two seconds after load. That
 * was the jump on the way into Templates: by the time you got there the heading had
 * already been thrown into position. The backstop now *reveals*, along the same
 * transition as everything else.
 *
 * And nothing stays hidden. Reveal is decoration; it is never allowed to be the
 * reason something cannot be read. Anything the observer has not reached within a
 * few seconds is shown regardless.
 */
const REVEAL_MS = 780;

function useRevealOnScroll() {
  useEffect(() => {
    /* Never hide anything if the browser cannot tell us when to bring it back. */
    if (!("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const vh = window.innerHeight || 800;
    const all = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const items = all.filter((el) => el.getBoundingClientRect().top > vh * 0.9);

    /* Put the inline properties back once the animation has finished, so a card's
       own hover transform is not permanently overridden by `transform: none`. */
    const settle = (el: HTMLElement) => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("filter");
      el.style.removeProperty("transition");
      el.style.removeProperty("will-change");
    };

    const shown = new WeakSet<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      if (shown.has(el)) return;
      shown.add(el);
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      window.setTimeout(() => settle(el), REVEAL_MS + 260);
    };

    items.forEach((el, i) => {
      const d = (i % 3) * 80;
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.filter = "blur(7px)";
      el.style.willChange = "opacity, transform, filter";
      el.style.transition =
        `opacity ${REVEAL_MS}ms cubic-bezier(.2,.8,.2,1) ${d}ms,` +
        `transform ${REVEAL_MS}ms cubic-bezier(.2,.8,.2,1) ${d}ms,` +
        `filter ${REVEAL_MS}ms cubic-bezier(.2,.8,.2,1) ${d}ms`;
    });

    /* A shade before the edge, so a block is already resolving by the time it is
       properly on screen rather than starting the moment you can see it. */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target as HTMLElement);
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    items.forEach((el) => io.observe(el));

    const backstop = window.setTimeout(() => {
      items.forEach(reveal);
    }, 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(backstop);
      /* Leaving the page mid-animation must not leave anything invisible. */
      items.forEach(settle);
    };
  }, []);
}

/**
 * The Templates section "claims" the floating memories once it is close enough
 * to the viewport. Reversible, so scrolling back up returns them to the hero.
 */
function useAssembleOnScroll(anchorRef: React.RefObject<HTMLDivElement | null>) {
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const evaluate = () => {
      const top = anchor.getBoundingClientRect().top;
      const vh = window.innerHeight || 800;
      setAssembled(top < vh * 0.72);
    };
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [anchorRef]);

  return assembled;
}

function Tag({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        ...cssStyle(
          "display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:3px;font-size:12.5px;font-weight:500"
        ),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Aside({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={cssStyle(
        "font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--label-on-dark)"
      )}
    >
      · {children} ·
    </div>
  );
}

function StampButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "brass" | "outlineDark" | "outlineLight";
  children: React.ReactNode;
}) {
  const variantClass =
    variant === "brass" ? styles.stampBrass : variant === "outlineDark" ? styles.stampOutlineDark : styles.stampOutlineLight;
  const isInternal = href.startsWith("/");
  const commonStyle = cssStyle(
    "display:inline-flex;align-items:center;padding:14px 26px;font-size:15px;font-weight:600"
  );
  if (isInternal) {
    return (
      <Link href={href} className={`${styles.stampBtn} ${variantClass}`} style={commonStyle}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`${styles.stampBtn} ${variantClass}`} style={commonStyle}>
      {children}
    </a>
  );
}

const COMPARISONS = [
  { was: "A TEXT MESSAGE", wasLine: "Scrolled past by lunchtime.", now: "A KINDLOOP", nowLine: "Opened again every anniversary." },
  { was: "A GIFT CARD", wasLine: "Spent, then forgotten.", now: "A MEMORY", nowLine: "Still on their phone in five years." },
  { was: "FLOWERS", wasLine: "Beautiful for four days.", now: "A SCRAPBOOK", nowLine: "Shown to guests who didn't ask." },
];

const RELATIONSHIPS = [
  "Girlfriend", "Boyfriend", "Wife", "Husband", "Mum", "Dad",
  "Best friend", "Sibling", "Teacher", "Grandparents",
];

const TESTIMONIALS = [
  { quote: "I sent it at midnight and she called me at 12:04 just to breathe at me.", who: "Arjun — Memoryverse, for his girlfriend" },
  { quote: "My mum doesn't understand apps. She understood this in four seconds.", who: "Lena — Scrapbook, for her mother's 60th" },
  { quote: "Five dollars and a Sunday afternoon. Best gift I've given anyone.", who: "Tomás — Scrapbook, for a colleague leaving" },
];

const OCCASIONS = [
  { name: "Birthdays", sub: "a year, in order" },
  { name: "Anniversary", sub: "every year since" },
  { name: "Love", sub: "no occasion needed" },
  { name: "Parents", sub: "the long version" },
  { name: "Graduation", sub: "four years, one link" },
  { name: "Wedding", sub: "invite, then album" },
  { name: "Promotion", sub: "how far they came" },
  { name: "Baby shower", sub: "notes for later" },
  { name: "Long distance", sub: "closes the gap a bit" },
  { name: "Friendship", sub: "one page each" },
  { name: "Proposal", sub: "the story first" },
  { name: "Condolence", sub: "a place to remember" },
];

export default function LandingPage({
  photos,
  accountMenu,
  signedIn = false,
}: {
  photos: string[];
  /* Handed down because the session is read on the server and this page is a
     client component. */
  accountMenu?: React.ReactNode;
  signedIn?: boolean;
}) {
  useRevealOnScroll();
  const phase = useEnvelopeSequence();
  const templatesAnchorRef = useRef<HTMLDivElement>(null);
  const assembled = useAssembleOnScroll(templatesAnchorRef);

  /* Read from the catalogue rather than written by hand, but deliberately
     without a number in it. Counting shipped experiences out loud invites the
     reader to decide whether nine is a lot, and the honest answer while this is
     still small is that it isn't the point. */
  const liveCount = TEMPLATE_CATALOG.filter((t) => t.status === "available").length;
  const readyNote =
    liveCount === 0 ? "all still in the workshop" : "ready now, with more in the workshop";

  return (
    <div
      className={`${theme.themeRoot} ${styles.penCursor} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable}`}
      style={{
        position: "relative",
        /* `clip`, not `hidden`: `overflow-x: hidden` turns this into a scroll
           container, which silently breaks `position: sticky` on the header
           inside it. `clip` cuts the overflow without that side effect. */
        overflowX: "clip",
        background:
          /* Kraft, with the weave showing. Flat colour reads as a swatch; the
             crossing fibres and the two warm washes are what make it a table
             something is lying on. */
          "repeating-linear-gradient(94deg, rgba(120,96,60,.045) 0 1px, transparent 1px 4px), " +
          "repeating-linear-gradient(4deg, rgba(120,96,60,.035) 0 1px, transparent 1px 5px), " +
          "radial-gradient(ellipse 90% 55% at 50% -6%, rgba(232,196,132,.44), transparent 62%), " +
          "radial-gradient(ellipse 66% 40% at 88% 16%, rgba(196,98,60,.18), transparent 66%), " +
          "linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 26%, var(--bg1) 58%, var(--bg0) 100%)",
        color: "var(--cream-muted)",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <FountainPenCursor />
      <div style={GRAIN_STYLE} />
      <div style={VIGNETTE_STYLE} />
      <div
        aria-hidden
        style={cssStyle(
          "position:fixed;left:50%;top:30%;transform:translate(-50%,-50%);width:1400px;height:1400px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(255,206,140,.2),rgba(226,132,92,.1) 45%,transparent 72%)"
        )}
      />

      <SiteHeader account={accountMenu} signedIn={signedIn} />

      <section style={cssStyle("position:relative;padding:84px 28px 116px")}>
        <div style={cssStyle("position:absolute;inset:-6% -8% 10%;pointer-events:none;overflow:hidden")}>
          <div className={styles.aura1} style={cssStyle("position:absolute;left:4%;top:0;width:560px;height:520px;border-radius:50%;background:radial-gradient(circle at 45% 45%, rgba(240,196,124,.3), rgba(240,196,124,0) 70%);filter:blur(20px)")} />
          <div className={styles.aura2} style={cssStyle("position:absolute;right:0;top:-8%;width:640px;height:620px;border-radius:50%;background:radial-gradient(circle at 50% 50%, rgba(224,124,84,.24), rgba(224,124,84,0) 70%);filter:blur(22px)")} />
          <div className={styles.aura3} style={cssStyle("position:absolute;left:34%;bottom:-10%;width:520px;height:420px;border-radius:50%;background:radial-gradient(circle, rgba(232,190,120,.26), rgba(232,190,120,0) 70%);filter:blur(24px)")} />
        </div>
        <CoffeeRing size={190} style={{ left: "-40px", bottom: "-30px", transform: "scale(1, .82) rotate(-8deg)" }} />
        <InkSplatter style={{ left: "6%", top: "18px" }} />

        <div style={cssStyle("position:relative;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:52px;align-items:center")}>
          <div>
            <div data-reveal="1" style={cssStyle("font-family:var(--font-gochi),cursive;font-size:20px;color:var(--rust);display:flex;align-items:center;gap:8px")}>
              {"More than a gift"} <span>♡</span>
            </div>
            <h1 data-reveal="1" style={cssStyle("margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(42px,5.2vw,78px);line-height:1.03;letter-spacing:-.018em;color:var(--cream);text-wrap:balance")}>
              {"Turn moments into something they'll "}
              <span style={cssStyle("position:relative;display:inline-block;color:var(--rust)")}>
                {"keep forever"}
                <svg
                  aria-hidden
                  viewBox="0 0 220 14"
                  preserveAspectRatio="none"
                  style={cssStyle("position:absolute;left:-2px;right:-2px;bottom:-8px;width:calc(100% + 4px);height:14px")}
                >
                  <path
                    d="M2 8 C 30 2, 55 12, 85 6 S 140 2, 170 8 S 205 11, 218 5"
                    fill="none"
                    stroke="var(--rust)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </span>
              .
            </h1>
            <p data-reveal="1" style={cssStyle("margin:24px 0 0;max-width:440px;font-size:17px;line-height:1.7;color:var(--cream-muted);text-wrap:pretty")}>
              {"Create beautiful, personal digital gifts — letters, memories, photo stories and more. They open in any browser. No app. Just a link."}
            </p>
            <div data-reveal="1" style={cssStyle("margin-top:32px;display:flex;flex-wrap:wrap;gap:14px")}>
              <StampButton href="/templates" variant="brass">{"Create a memory  ✦"}</StampButton>
              <StampButton href="/demo" variant="outlineLight">{"Watch demos  →"}</StampButton>
            </div>
            <div data-reveal="1" style={cssStyle("margin-top:34px;display:flex;flex-wrap:wrap;gap:26px")}>
              {[
                { icon: "🌐", line1: "Opens", line2: "anywhere" },
                { icon: "📵", line1: "No app", line2: "needed" },
                { icon: "🔒", line1: "Private", line2: "by default" },
                { icon: "🕒", line1: "Made in", line2: "minutes" },
              ].map((f) => (
                <div key={f.line1} style={cssStyle("display:flex;flex-direction:column;gap:6px")}>
                  <span style={cssStyle("font-size:17px")}>{f.icon}</span>
                  <span style={cssStyle("font-size:12.5px;line-height:1.35;color:var(--ink-muted)")}>
                    {f.line1}
                    <br />
                    {f.line2}
                  </span>
                </div>
              ))}
            </div>
            <div data-reveal="1" style={cssStyle("margin-top:34px;font-family:var(--font-gochi),cursive;font-size:21px;line-height:1.4;color:var(--khaki)")}>
              {"For the people"}
              <br />
              {"who matter most  ♡"}
            </div>
          </div>

          <HeroStage photos={photos} phase={phase} assembled={assembled} />
        </div>
      </section>

      <section id="what" style={cssStyle("padding:96px 28px")}>
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("max-width:660px")}>
            <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.16em;color:var(--label-on-dark)")}>{"SO WHAT IS IT"}</div>
            <h2 style={cssStyle("margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>
              {"A private little website, made out of your memories."}
            </h2>
            <p style={cssStyle("margin:16px 0 0;font-size:17px;line-height:1.65;color:var(--cream-muted);max-width:560px")}>
              {"Not a card. Not a gallery link. Something built by hand, that only one person has the address for."}
            </p>
          </div>

          <div style={cssStyle("margin-top:44px;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px")}>
            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);position:relative;overflow:hidden")}>
                <div style={cssStyle("position:absolute;left:18px;top:16px;width:64px;height:64px;border-radius:4px;background:var(--paper);box-shadow:0 8px 16px -10px rgba(0,0,0,.4);transform:rotate(-8deg)")} />
                <div style={cssStyle("position:absolute;left:52px;top:22px;width:64px;height:64px;border-radius:4px;background:var(--tan);box-shadow:0 8px 16px -10px rgba(0,0,0,.4);transform:rotate(6deg)")} />
                <div style={cssStyle("position:absolute;right:16px;bottom:12px;font-family:var(--font-gochi),cursive;font-size:18px;color:var(--rust)")}>{"by you"}</div>
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Personal"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Your photos, your handwriting, your inside jokes. Nothing generated for you."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center")}>
                <div style={cssStyle("width:78px;height:56px;border-radius:4px;background:var(--paper);position:relative")}>
                  <div style={cssStyle("position:absolute;left:50%;top:-11px;transform:translateX(-50%);width:22px;height:22px;border:3px solid var(--deep);border-bottom:none;border-radius:11px 11px 0 0")} />
                  <div style={cssStyle("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:9px;height:9px;border-radius:50%;background:var(--rust)")} />
                </div>
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Private"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Unlisted and unsearchable. Only whoever holds the link, and you can revoke it."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center")}>
                <div style={cssStyle("padding:9px 14px;border-radius:3px;background:var(--paper);box-shadow:0 10px 20px -12px rgba(0,0,0,.35);font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;color:var(--ink)")}>{"kindloop.to/for-amma"}</div>
                <div className={styles.motes1} style={cssStyle("position:absolute;left:22px;top:14px;width:5px;height:5px;border-radius:50%;background:var(--brass-bright)")} />
                <div className={styles.motes2} style={cssStyle("position:absolute;right:30px;top:26px;width:4px;height:4px;border-radius:50%;background:var(--rust-light)")} />
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Instant"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Most people finish in an evening. The link works the second you're done."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;gap:8px")}>
                <div style={cssStyle("width:38px;height:60px;border-radius:4px 4px 0 0;background:var(--paper);border:1px solid rgba(33,27,22,.12);border-bottom:none")} />
                <div style={cssStyle("width:74px;height:46px;border-radius:4px 4px 0 0;background:var(--paper);border:1px solid rgba(33,27,22,.12);border-bottom:none")} />
                <div style={cssStyle("width:52px;height:34px;border-radius:4px 4px 0 0;background:var(--tan);border:1px solid rgba(33,27,22,.12);border-bottom:none")} />
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Works anywhere"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Any browser, any device, including the ten-year-old phone your mum still uses."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);position:relative;overflow:hidden;padding:14px")}>
                <div style={cssStyle("display:grid;grid-template-columns:repeat(3,1fr);gap:6px")}>
                  <div style={cssStyle("height:32px;border-radius:3px;background:var(--khaki-pale)")} />
                  <div style={cssStyle("height:32px;border-radius:3px;background:var(--tan)")} />
                  <div style={cssStyle("height:32px;border-radius:3px;background:var(--tan-deep)")} />
                </div>
                <div style={cssStyle("margin-top:8px;height:7px;width:70%;border-radius:4px;background:rgba(33,27,22,.15)")} />
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Photos with words"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"A caption under each one turns an album into a story worth reading."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);display:flex;align-items:center;justify-content:center;gap:4px")}>
                {[22, 58, 88, 42, 70, 30, 64, 24].map((h, i) => (
                  <div key={i} style={cssStyle(`width:4px;height:${h}%;background:${h >= 55 ? "var(--deep)" : "var(--tan)"};border-radius:3px`)} />
                ))}
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Your actual voice"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Record thirty seconds per photo. It lands differently than typing does."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCard} style={cssStyle("padding:22px;border-radius:10px;background:var(--paper);transition:transform .3s ease,box-shadow .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:var(--paper-muted);display:flex;align-items:center;justify-content:center")}>
                <div style={cssStyle("width:104px;padding:10px;border-radius:4px;background:var(--paper)")}>
                  <div style={cssStyle("display:grid;grid-template-columns:repeat(7,1fr);gap:3px")}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} style={cssStyle(`height:8px;border-radius:2px;background:${i === 2 ? "var(--brass-bright)" : "rgba(33,27,22,.1)"}`)} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600;color:var(--ink)")}>{"Opens on a date"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{"Set it now, sealed until the morning of. Useful for birthdays you'll be busy on."}</p>
            </div>

            <div data-reveal="1" className={styles.featureCardDark} style={cssStyle("padding:22px;border-radius:10px;background:var(--deep);color:var(--on-dark);transition:transform .3s ease")}>
              <div style={cssStyle("height:96px;border-radius:6px;background:rgba(244,236,221,.08);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center")}>
                <div style={cssStyle("width:80px;height:58px;border-radius:4px;background:var(--paper);box-shadow:0 10px 22px -10px rgba(0,0,0,.6);transform:rotate(-4deg)")} />
                <div style={cssStyle("position:absolute;right:22px;top:18px;width:26px;height:26px;border-radius:50%;border:1px dashed var(--brass-bright)")} />
              </div>
              <div style={cssStyle("margin-top:16px;font-size:18px;font-weight:600")}>{"Alive, not printed"}</div>
              <p style={cssStyle("margin:7px 0 0;font-size:14.5px;line-height:1.6;color:var(--on-dark-muted)")}>{"Pages turn, timelines scroll, voices play. A card can't do any of that."}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={cssStyle("position:relative;padding:96px 28px;border-top:1px solid rgba(244,236,221,.06);border-bottom:1px solid rgba(244,236,221,.06)")}>
        <CoffeeRing size={140} faint style={{ right: "6%", top: "-20px", transform: "scale(.9, 1.1) rotate(14deg)" }} />
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:18px")}>
            <h2 style={cssStyle("margin:0;max-width:560px;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>
              {"Three steps, and then someone smiles."}
            </h2>
            <div style={cssStyle("font-family:var(--font-gochi),cursive;font-size:22px;color:var(--brass)")}>{"no design skills required"}</div>
          </div>

          <div style={cssStyle("position:relative;margin-top:52px")}>
            <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={cssStyle("position:absolute;left:0;right:0;top:120px;width:100%;height:60px;pointer-events:none;opacity:.5")}>
              <path d="M60 40 C 300 -10, 380 80, 600 30 S 900 -10, 1140 40" fill="none" stroke="var(--rust)" strokeWidth="2" strokeDasharray="7 9" className={styles.dashPath} />
            </svg>
            <div style={cssStyle("display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px")}>
              <div data-reveal="1" style={cssStyle("position:relative;padding:26px;border-radius:10px;background:var(--deep2);border:1px solid rgba(244,236,221,.08)")}>
                <div style={cssStyle("height:158px;border-radius:6px;background:var(--paper);position:relative;overflow:hidden")}>
                  <div style={photoStyle(photos, 6, "position:absolute;left:20px;top:28px;width:86px;height:108px;border-radius:4px;box-shadow:0 12px 24px -14px rgba(0,0,0,.4);transform:rotate(-7deg)", "var(--paper-muted)")} />
                  <div style={photoStyle(photos, 7, "position:absolute;left:74px;top:20px;width:86px;height:108px;border-radius:4px;box-shadow:0 12px 24px -14px rgba(0,0,0,.4);transform:rotate(4deg)", "var(--tan)")} />
                  <div style={photoStyle(photos, 8, "position:absolute;left:132px;top:32px;width:86px;height:108px;border-radius:4px;box-shadow:0 12px 24px -14px rgba(0,0,0,.4);transform:rotate(-2deg)", "var(--paper-muted)")} />
                </div>
                <div style={cssStyle("margin-top:20px;display:flex;align-items:center;gap:10px")}>
                  <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;letter-spacing:.14em;color:var(--brass-bright)")}>{"STEP 01"}</span>
                  <span style={cssStyle("flex:1;height:1px;background:rgba(244,236,221,.12)")} />
                </div>
                <div style={cssStyle("margin-top:12px;font-family:var(--font-fraunces),serif;font-size:28px;color:var(--on-dark)")}>{"Choose a template"}</div>
                <p style={cssStyle("margin:9px 0 0;font-size:15px;line-height:1.6;color:var(--on-dark-muted)")}>{"Pick a finished experience, not a blank canvas. Timeline, scrapbook, letter — each one already knows how to be beautiful."}</p>
              </div>

              <div data-reveal="1" style={cssStyle("position:relative;padding:26px;border-radius:10px;background:var(--deep2);border:1px solid rgba(244,236,221,.08)")}>
                <div style={cssStyle("height:158px;border-radius:6px;background:var(--paper);position:relative;overflow:hidden;padding:16px")}>
                  <div style={photoStyle(photos, 9, "height:54px;border-radius:4px", "var(--paper-muted)")} />
                  <div style={cssStyle("margin-top:10px;display:flex;flex-wrap:wrap;gap:6px")}>
                    {["photos", "captions", "voice", "music", "letters"].map((tag) => (
                      <span key={tag} style={cssStyle("padding:4px 9px;border-radius:3px;background:var(--paper-muted);font-size:11.5px;color:var(--ink)")}>{tag}</span>
                    ))}
                  </div>
                  <div style={cssStyle("position:absolute;right:14px;bottom:10px;font-family:var(--font-gochi),cursive;font-size:19px;color:var(--rust)")}>{"your words →"}</div>
                </div>
                <div style={cssStyle("margin-top:20px;display:flex;align-items:center;gap:10px")}>
                  <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;letter-spacing:.14em;color:var(--brass-bright)")}>{"STEP 02"}</span>
                  <span style={cssStyle("flex:1;height:1px;background:rgba(244,236,221,.12)")} />
                </div>
                <div style={cssStyle("margin-top:12px;font-family:var(--font-fraunces),serif;font-size:28px;color:var(--on-dark)")}>{"Add the memories"}</div>
                <p style={cssStyle("margin:9px 0 0;font-size:15px;line-height:1.6;color:var(--on-dark-muted)")}>{"Drag photos in, write the line only the two of you would understand, record your voice, reorder until it sounds like you."}</p>
              </div>

              <div data-reveal="1" style={cssStyle("position:relative;padding:26px;border-radius:10px;background:var(--deep2);border:1px solid rgba(244,236,221,.08)")}>
                <div style={cssStyle("height:158px;border-radius:6px;background:var(--paper);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center")}>
                  <div style={cssStyle("padding:11px 16px;border-radius:3px;background:var(--paper-muted);box-shadow:0 12px 24px -14px rgba(0,0,0,.3);font-family:var(--font-ibm-plex-mono),monospace;font-size:11.5px;color:var(--ink)")}>{"kindloop.to/for-amma"}</div>
                  <div className={styles.motes3} style={cssStyle("position:absolute;left:26px;top:20px;width:5px;height:5px;border-radius:50%;background:var(--brass-bright)")} />
                  <div className={styles.motes4} style={cssStyle("position:absolute;right:34px;top:34px;width:4px;height:4px;border-radius:50%;background:var(--rust-light)")} />
                </div>
                <div style={cssStyle("margin-top:20px;display:flex;align-items:center;gap:10px")}>
                  <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;letter-spacing:.14em;color:var(--brass-bright)")}>{"STEP 03"}</span>
                  <span style={cssStyle("flex:1;height:1px;background:rgba(244,236,221,.12)")} />
                </div>
                <div style={cssStyle("margin-top:12px;font-family:var(--font-fraunces),serif;font-size:28px;color:var(--on-dark)")}>{"Send one private link"}</div>
                <p style={cssStyle("margin:9px 0 0;font-size:15px;line-height:1.6;color:var(--on-dark-muted)")}>{"They tap it and they're inside. No sign-up, no download, no app store detour on the way to being moved."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="templates" style={cssStyle("position:relative;padding:96px 28px")}>
        <CoffeeRing size={210} faint style={{ left: "-60px", bottom: "10%", transform: "scale(1.05, .88) rotate(-5deg)" }} />
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("max-width:640px;position:relative")}>
            <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.16em;color:var(--label-on-dark)")}>{"TEMPLATES"}</div>
            <h2 style={cssStyle("margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>
              {"Everything you just saw came out of that envelope."}
            </h2>
            <InkSplatter style={{ left: "calc(100% + 14px)", top: "8px" }} />
          </div>

          {/* The memories that left the envelope land here, each one developing
              into focus as it reaches the viewport. */}
          <div ref={templatesAnchorRef} style={cssStyle("margin-top:42px")}>
            <AssembledMemories photos={photos} />
          </div>

          <div style={cssStyle("margin-top:34px;display:flex;flex-wrap:wrap;align-items:center;gap:14px")}>
            <StampButton href="/templates" variant="brass">{"Browse all templates  \u2192"}</StampButton>
            <Aside>{readyNote}</Aside>
          </div>
        </div>
      </section>

      {/*
        Inside a memory.
        
        Redesigned onto the same kraft as the rest of the page. It used to be a
        full-bleed dark panel fading in and out of the background, which since the
        palette became vintage paper read as a muddy brown smear across the middle
        of the page — and the two fades were the ugliest part of it. Now it is what
        the reference is: paper laid on a table, held down with tape, with the notes
        written on a card beside it.
      */}
      <section id="inside" style={cssStyle("position:relative;padding:96px 28px")}>
        <CoffeeRing size={200} faint style={{ right: "-56px", top: "8%", transform: "scale(1,.86) rotate(11deg)" }} />

        <div style={cssStyle("position:relative;max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("max-width:620px")}>
            <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.16em;color:var(--label-on-dark)")}>{"INSIDE A MEMORY"}</div>
            <h2 style={cssStyle("margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>
              {"What one page is actually made of."}
            </h2>
            <p style={cssStyle("margin:16px 0 0;font-size:17px;line-height:1.65;color:var(--cream-muted);max-width:540px")}>
              {"A single spread from a Digital Scrapbook, taken apart. Every piece is something you chose."}
            </p>
          </div>

          <div style={cssStyle("margin-top:46px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:44px;align-items:start")}>
            {/* the spread itself, sitting slightly askew on the table */}
            <div data-reveal="1" style={cssStyle("position:relative")}>
              <div
                className={theme.paperSheet}
                style={cssStyle("position:relative;padding:22px;border-radius:4px;transform:rotate(-1.1deg);border:1px solid rgba(58,42,24,.14)")}
              >
                {/* a strip of tape holding it down */}
                <span
                  aria-hidden
                  style={cssStyle("position:absolute;left:-18px;top:26px;width:72px;height:24px;transform:rotate(-24deg);background:linear-gradient(160deg,rgba(226,208,168,.85),rgba(206,184,140,.7));box-shadow:0 2px 5px rgba(46,30,14,.18)")}
                />
                <div style={cssStyle("display:grid;grid-template-columns:1.1fr 1fr;gap:16px")}>
                  <div>
                    <div style={photoStyle(photos, 14, "position:relative;height:150px;border-radius:2px;box-shadow:0 8px 18px -12px rgba(46,30,14,.6)", "var(--tan)")} />
                    <div style={cssStyle("margin-top:11px;font-family:var(--font-gochi),cursive;font-size:20px;color:var(--ink)")}>{"the kitchen in Lisbon"}</div>
                  </div>
                  <div>
                    <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:9px;letter-spacing:.1em;color:var(--label-on-paper)")}>{"SPREAD 04"}</div>
                    <div style={cssStyle("margin-top:8px;font-family:var(--font-fraunces),serif;font-size:19px;line-height:1.3;color:var(--ink)")}>{"You burned the rice and we ate it anyway."}</div>
                    <div style={cssStyle("margin-top:10px;display:grid;gap:6px")}>
                      <div style={cssStyle("height:1px;background:rgba(58,42,24,.16)")} />
                      <div style={cssStyle("height:1px;background:rgba(58,42,24,.16)")} />
                      <div style={cssStyle("height:1px;background:rgba(58,42,24,.16);width:62%")} />
                    </div>
                    <div style={cssStyle("margin-top:14px;display:flex;align-items:center;gap:9px")}>
                      <div style={cssStyle("width:24px;height:24px;border-radius:50%;background:var(--rust);display:flex;align-items:center;justify-content:center;color:#fdf6e8;font-size:9px")}>{"\u25B6"}</div>
                      <div style={cssStyle("display:flex;align-items:flex-end;gap:2px;height:18px")}>
                        {[40, 80, 55, 95, 45, 70, 38].map((h, i) => (
                          <div key={i} style={cssStyle(`width:3px;height:${h}%;background:${h >= 70 ? "var(--rust)" : "var(--tan-deep)"};border-radius:2px`)} />
                        ))}
                      </div>
                      <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:9px;color:var(--label-on-paper)")}>{"0:30"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* the next page, showing underneath */}
              <span
                aria-hidden
                style={cssStyle("position:absolute;left:14px;right:-10px;bottom:-9px;height:22px;border-radius:0 0 4px 4px;background:var(--paper-muted);transform:rotate(-.4deg);box-shadow:0 10px 22px -16px rgba(46,30,14,.6);z-index:-1")}
              />
            </div>

            {/* the notes, on a card clipped to the table */}
            <div
              data-reveal="1"
              className={theme.paperSheet}
              style={cssStyle("position:relative;padding:30px 28px;border-radius:4px;transform:rotate(.5deg);border:1px solid rgba(58,42,24,.14)")}
            >
              <span
                aria-hidden
                style={cssStyle("position:absolute;right:26px;top:-13px;width:20px;height:44px;border:2.5px solid var(--brass-bright);border-radius:10px 10px 3px 3px;border-bottom-color:transparent;opacity:.85")}
              />
              <div style={cssStyle("display:grid;gap:19px")}>
                {[
                  { n: "01", title: "The photo, taped in", body: "Drop yours in and it lands slightly crooked, like it would on paper." },
                  { n: "02", title: "A handwritten caption", body: "Six words in your own script, sitting under the picture where it belongs." },
                  { n: "03", title: "The story on the facing page", body: "As long or as short as you want. This is the part they read twice." },
                  { n: "04", title: "Thirty seconds of your voice", body: "Optional, and the thing people replay most." },
                  { n: "05", title: "The page edge", body: "Drag it and the paper turns, with weight. Small thing. Changes everything." },
                ].map((item) => (
                  <div key={item.n} style={cssStyle("display:flex;gap:14px")}>
                    <span style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;color:var(--rust);padding-top:4px")}>{item.n}</span>
                    <div>
                      <div style={cssStyle("font-size:16.5px;font-weight:600;color:var(--ink)")}>{item.title}</div>
                      <p style={cssStyle("margin:5px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink-muted)")}>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={cssStyle("padding:96px 28px")}>
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("max-width:600px")}>
            <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.16em;color:var(--label-on-dark)")}>{"WHY WE MADE THIS"}</div>
            <h2 style={cssStyle("margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>
              {"Everything we send disappears. This doesn't."}
            </h2>
          </div>
          <div style={cssStyle("margin-top:42px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px")}>
            {COMPARISONS.map((c) => (
              <div key={c.was} data-reveal="1" style={cssStyle("padding:26px;border-radius:10px;background:var(--paper)")}>
                <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;letter-spacing:.12em;color:var(--label-on-paper)")}>{c.was}</div>
                <div style={cssStyle("margin-top:10px;font-size:16px;color:var(--ink-faint)")}>{c.wasLine}</div>
                <div style={cssStyle("margin:18px 0;height:1px;background:rgba(33,27,22,.14)")} />
                <div style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;letter-spacing:.12em;color:var(--rust)")}>{c.now}</div>
                <div style={cssStyle("margin-top:10px;font-family:var(--font-fraunces),serif;font-size:25px;line-height:1.25;color:var(--ink)")}>{c.nowLine}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={cssStyle("padding:0 28px 96px")}>
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px")}>
            <h2 style={cssStyle("margin:0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(28px,3vw,42px);line-height:1.1;color:var(--cream)")}>{"The moments people save"}</h2>
            <Aside>{"real pages, names removed"}</Aside>
          </div>
          <div className={styles.masonry} style={cssStyle("margin-top:30px")}>
            <div data-reveal="1" style={photoStyle(photos, 15, "break-inside:avoid;margin-bottom:16px;height:180px;border-radius:3px;position:relative;transform:rotate(-1.5deg);box-shadow:0 16px 32px -22px rgba(0,0,0,.6)", "var(--tan)")}>
              <div style={cssStyle("position:absolute;left:14px;bottom:12px;font-family:var(--font-gochi),cursive;font-size:18px;color:var(--paper);background:rgba(20,15,12,.5);padding:2px 6px;border-radius:2px")}>{"40 years of kitchens"}</div>
            </div>
            <div data-reveal="1" style={cssStyle("break-inside:avoid;margin-bottom:16px;padding:16px;background:var(--deep);border-radius:8px;color:var(--on-dark)")}>
              <div style={cssStyle("font-family:var(--font-fraunces),serif;font-size:21px;line-height:1.3")}>{"“Open when you can't sleep.”"}</div>
              <div style={cssStyle("margin-top:10px;font-family:var(--font-ibm-plex-mono),monospace;font-size:9.5px;letter-spacing:.1em;color:var(--brass-bright)")}>{"LETTER 3 OF 7"}</div>
            </div>
            <div data-reveal="1" style={photoStyle(photos, 16, "break-inside:avoid;margin-bottom:16px;height:130px;border-radius:3px;position:relative;transform:rotate(1.2deg);box-shadow:0 16px 32px -22px rgba(0,0,0,.6)", "var(--khaki)")}>
              <div style={cssStyle("position:absolute;left:14px;bottom:12px;font-family:var(--font-gochi),cursive;font-size:18px;color:var(--paper);background:rgba(20,15,12,.5);padding:2px 6px;border-radius:2px")}>{"hostel, 2018"}</div>
            </div>
            <div data-reveal="1" style={cssStyle("break-inside:avoid;margin-bottom:16px;padding:14px;background:var(--paper);border-radius:8px")}>
              <div style={cssStyle("display:flex;align-items:center;gap:9px")}>
                <div style={cssStyle("width:26px;height:26px;border-radius:50%;background:var(--rust)")} />
                <div style={cssStyle("display:flex;align-items:flex-end;gap:2px;height:20px")}>
                  {[40, 85, 55, 100, 35].map((h, i) => (
                    <div key={i} style={cssStyle(`width:3px;height:${h}%;background:${h >= 70 ? "var(--deep)" : "var(--tan)"};border-radius:2px`)} />
                  ))}
                </div>
              </div>
              <div style={cssStyle("margin-top:9px;font-size:13px;color:var(--ink-muted)")}>{"grandma singing the birthday song"}</div>
            </div>
            <div data-reveal="1" style={photoStyle(photos, 17, "break-inside:avoid;margin-bottom:16px;height:206px;border-radius:3px;position:relative;transform:rotate(1.8deg);box-shadow:0 16px 32px -22px rgba(0,0,0,.6)", "var(--tan-deep)")}>
              <div style={cssStyle("position:absolute;left:14px;bottom:12px;font-family:var(--font-gochi),cursive;font-size:18px;color:var(--paper);background:rgba(20,15,12,.5);padding:2px 6px;border-radius:2px")}>{"the day she said yes"}</div>
            </div>
            <div data-reveal="1" style={cssStyle("break-inside:avoid;margin-bottom:16px;padding:16px;background:var(--khaki-light);border-radius:8px")}>
              <div style={cssStyle("font-family:var(--font-fraunces),serif;font-size:20px;line-height:1.3;color:var(--ink)")}>{"Eleven friends, one page each."}</div>
              <div style={cssStyle("margin-top:8px;font-size:13px;color:var(--ink-muted)")}>{"Graduation scrapbook, 2025"}</div>
            </div>
            <div data-reveal="1" style={cssStyle("break-inside:avoid;margin-bottom:16px;padding:8px;background:var(--deep2);border-radius:4px")}>
              <div style={cssStyle("display:grid;gap:6px")}>
                <div style={photoStyle(photos, 18, "height:58px;border-radius:2px", "var(--tan)")} />
                <div style={photoStyle(photos, 19, "height:58px;border-radius:2px", "var(--khaki)")} />
                <div style={photoStyle(photos, 20, "height:58px;border-radius:2px", "var(--tan-deep)")} />
              </div>
            </div>
            <div data-reveal="1" style={photoStyle(photos, 21, "break-inside:avoid;margin-bottom:16px;height:150px;border-radius:3px;position:relative;transform:rotate(-1.1deg);box-shadow:0 16px 32px -22px rgba(0,0,0,.6)", "var(--khaki)")}>
              <div style={cssStyle("position:absolute;left:14px;bottom:12px;font-family:var(--font-gochi),cursive;font-size:18px;color:var(--paper);background:rgba(20,15,12,.5);padding:2px 6px;border-radius:2px")}>{"dad's last shift"}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="occasions" style={cssStyle("position:relative;padding:96px 28px;border-top:1px solid rgba(244,236,221,.06);border-bottom:1px solid rgba(244,236,221,.06)")}>
        <CoffeeRing size={165} style={{ left: "8%", top: "-24px", transform: "scale(.85, 1) rotate(-16deg)" }} />
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px")}>
            <h2 style={cssStyle("margin:0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)")}>{"Moments worth making one for"}</h2>
            <div style={cssStyle("font-size:15px;color:var(--cream-muted)")}>{"Or an ordinary Thursday. That counts."}</div>
          </div>
          <div style={cssStyle("margin-top:36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(198px,1fr));gap:14px")}>
            {OCCASIONS.map((o, i) => (
              <div key={o.name} data-reveal="1" className={styles.occasionCard} style={cssStyle("padding:14px;border-radius:8px;background:var(--paper);border:1px solid;transition:transform .3s ease,border-color .3s ease")}>
                <div style={photoStyle(photos, 12 + i, "height:88px;border-radius:5px", "var(--tan)")} />
                <div style={cssStyle("margin-top:13px;font-family:var(--font-fraunces),serif;font-size:21px;color:var(--ink)")}>{o.name}</div>
                <div style={cssStyle("margin-top:3px;font-size:12.5px;color:var(--ink-faint)")}>{o.sub}</div>
              </div>
            ))}
          </div>

          <div data-reveal="1" style={cssStyle("margin-top:44px;padding:26px;border-radius:10px;background:var(--deep2);border:1px solid rgba(244,236,221,.08)")}>
            <div style={cssStyle("display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px")}>
              <div style={cssStyle("font-family:var(--font-fraunces),serif;font-size:26px;color:var(--on-dark)")}>{"Made for every relationship"}</div>
              <div style={cssStyle("font-family:var(--font-gochi),cursive;font-size:20px;color:var(--brass-bright)")}>{"pick who it's for"}</div>
            </div>
            <div style={cssStyle("margin-top:18px;display:flex;flex-wrap:wrap;gap:9px")}>
              {RELATIONSHIPS.map((r) => (
                <span key={r} style={cssStyle("padding:9px 16px;border-radius:3px;background:var(--paper);border:1px solid rgba(43,38,32,.12);font-size:14px;color:var(--ink)")}>{r}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Placed before the testimonials on purpose: it answers "who is this for"
          just as somebody starts wondering whether it is for them. */}
      <MemoryOrbit photos={photos} />

      <section style={cssStyle("padding:96px 28px")}>
        <div style={cssStyle("max-width:1200px;margin:0 auto")}>
          <div data-reveal="1" style={cssStyle("font-family:var(--font-ibm-plex-mono),monospace;font-size:11px;letter-spacing:.16em;color:var(--label-on-dark)")}>{"FROM PEOPLE WHO MADE ONE"}</div>
          <div style={cssStyle("margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px")}>
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.who} data-reveal="1" style={cssStyle("margin:0;padding:28px;border-radius:10px;background:var(--paper)")}>
                <p style={cssStyle("margin:0;font-family:var(--font-fraunces),serif;font-style:italic;font-size:22px;line-height:1.35;color:var(--ink)")}>{t.quote}</p>
                <footer style={cssStyle("margin-top:16px;font-size:13.5px;color:var(--ink-faint)")}>{t.who}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      <section id="create" style={cssStyle("position:relative;padding:118px 28px 126px;overflow:hidden")}>
        <div style={cssStyle("position:absolute;inset:0;pointer-events:none")}>
          <div className={styles.aura4} style={cssStyle("position:absolute;left:10%;top:8%;width:520px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(201,154,68,.24),rgba(201,154,68,0) 70%);filter:blur(18px)")} />
          <div className={styles.aura5} style={cssStyle("position:absolute;right:6%;bottom:-6%;width:500px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(180,80,42,.22),rgba(180,80,42,0) 70%);filter:blur(20px)")} />
        </div>
        <CoffeeRing size={175} faint style={{ right: "-45px", bottom: "-20px", transform: "scale(1, .9) rotate(9deg)" }} />
        <div data-reveal="1" style={cssStyle("position:relative;max-width:840px;margin:0 auto;text-align:center")}>
          <h2 style={cssStyle("margin:0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(38px,5vw,68px);line-height:1.05;letter-spacing:-.018em;color:var(--cream);text-wrap:balance")}>
            {"Someone you love is one thoughtful gift away."}
          </h2>
          <p style={cssStyle("margin:20px auto 0;max-width:520px;font-size:17.5px;line-height:1.65;color:var(--cream-muted)")}>
            {"Start with the free timeline. If it grows into something bigger, the scrapbook is five dollars, once."}
          </p>
          <div style={cssStyle("margin-top:32px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center")}>
            <StampButton href="/templates" variant="brass">{"Create your first memory"}</StampButton>
            <StampButton href="#how" variant="outlineLight">{"See how it works"}</StampButton>
          </div>
          <div style={cssStyle("margin-top:24px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center")}>
            {["Free to start", "No account for them", "Private link", "Delete any time"].map((label) => (
              <Tag key={label} style={cssStyle("background:var(--khaki-pale);color:var(--ink)")}>{label}</Tag>
            ))}
          </div>
          <div style={cssStyle("margin-top:22px")}>
            <Aside>{"takes an evening, lasts a lot longer"}</Aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
