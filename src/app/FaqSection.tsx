"use client";

import Link from "next/link";
import { cssStyle } from "@/lib/uiStyle";
import { FEATURED_FAQS } from "@/lib/faq";
import { FaqAccordion } from "./FaqAccordion";
import styles from "./chrome.module.css";

/**
 * The five questions people ask first, and a way to the rest.
 *
 * Five, not sixteen. A landing page that answers every possible question stops
 * being a landing page — the job here is to clear the handful of doubts standing
 * between somebody and trying it, then get out of the way.
 *
 * Built in the same ruled column as `/faq`, so arriving there from here feels like
 * turning a page rather than landing somewhere else. Deliberately *without* the
 * search box and filters: five items across five groups means every filter would
 * leave one card standing, and a search over five questions is a control that
 * exists to look busy.
 */
export function FaqSection() {
  return (
    <section id="faq" style={cssStyle("position:relative;padding:96px 28px")}>
      <div className={styles.faqRails}>
        <div data-reveal="1" className={styles.faqBand} style={cssStyle("padding:0 24px 38px;text-align:center")}>
          <div
            style={cssStyle(
              "font-family:var(--font-ibm-plex-mono),monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--label-on-dark)"
            )}
          >
            {"QUESTIONS"}
          </div>
          <h2
            style={cssStyle(
              "margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,48px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)"
            )}
          >
            {"The things people ask first"}
          </h2>
          <p
            style={cssStyle(
              "margin:14px auto 0;max-width:430px;font-size:15.5px;line-height:1.65;color:var(--cream-muted)"
            )}
          >
            {"The five that come up before anyone makes their first one."}
          </p>
        </div>

        <div data-reveal="1" style={cssStyle("padding:34px 24px 0")}>
          <FaqAccordion items={FEATURED_FAQS} idPrefix="home-faq" />
        </div>

        <div
          data-reveal="1"
          style={cssStyle(
            "padding:34px 24px 6px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center"
          )}
        >
          <Link
            href="/faq"
            style={cssStyle(
              "display:inline-flex;align-items:center;gap:9px;padding:12px 24px;border-radius:999px;background:var(--brass);color:var(--on-dark);font-size:14.5px;text-decoration:none"
            )}
          >
            {"Read all the questions"}
            <span aria-hidden>{"→"}</span>
          </Link>
          <span style={cssStyle("font-size:13.5px;color:var(--cream-muted)")}>
            {"Privacy, money, and what happens afterwards"}
          </span>
        </div>
      </div>
    </section>
  );
}
