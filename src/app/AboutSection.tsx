"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { cssStyle } from "@/lib/uiStyle";
import { ChipTable } from "./ChipTable";

/**
 * About Us — a bento grid.
 *
 * Laid out like the reference: a column of small cards on the left showing the
 * product doing its actual job, and one tall card on the right holding the
 * experiences themselves as loose tags you can pick up. They are read from the
 * catalogue, so this section can never advertise something that doesn't exist.
 *
 * Each small card is a *miniature of a real screen* rather than an icon and a
 * sentence. The claim being made is that this is handmade, and abstract icons would
 * undercut it.
 */

const card =
  "position:relative;border-radius:16px;background-color:var(--paper);" +
  "background-image:radial-gradient(circle at 17% 23%,rgba(120,96,60,.11) .6px,transparent .9px)," +
  "radial-gradient(circle at 71% 66%,rgba(120,96,60,.09) .5px,transparent .8px);" +
  "background-size:37px 41px,53px 47px;" +
  "border:1px solid rgba(58,42,24,.16);box-shadow:0 20px 44px -28px rgba(46,30,14,.55);overflow:hidden";

const label =
  "font-family:var(--font-ibm-plex-mono),monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--label-on-paper)";

export function AboutSection({ heading = true }: { heading?: boolean } = {}) {
  const reduced = useReducedMotion();
  const live = TEMPLATE_CATALOG.filter((t) => t.status === "available");

  return (
    <section id="about" style={cssStyle("position:relative;padding:96px 28px")}>
      <div style={cssStyle("max-width:1200px;margin:0 auto")}>
        {heading && (
        <div data-reveal="1" style={cssStyle("text-align:center;max-width:620px;margin:0 auto")}>
          <div style={cssStyle(label)}>{"ABOUT US"}</div>
          <h2
            style={cssStyle(
              "margin:14px 0 0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,3.6vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)"
            )}
          >
            {"Made by hand, one experience at a time."}
          </h2>
          <p style={cssStyle("margin:16px auto 0;max-width:520px;font-size:16.5px;line-height:1.65;color:var(--cream-muted)")}>
            {"Not a template filled in with different colours. Every one is its own object, with its own way of opening."}
          </p>
        </div>
        )}

        <div
          data-reveal="1"
          style={cssStyle(
            "margin-top:34px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;align-items:stretch"
          )}
        >
          {/* ---------- left column ---------- */}
          <div style={cssStyle("display:flex;flex-direction:column;gap:18px")}>
            <div style={cssStyle("display:grid;grid-template-columns:1fr 1fr;gap:18px")}>
              {/* pick one */}
              <div style={cssStyle(`${card};padding:20px`)}>
                <div style={cssStyle(label)}>{"PICK ONE"}</div>
                <div style={cssStyle("margin-top:14px;display:flex;flex-direction:column;gap:8px")}>
                  {live.slice(0, 3).map((t, i) => (
                    <div
                      key={t.id}
                      style={cssStyle(
                        `display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;background:${
                          i === 0 ? "rgba(181,80,46,.1)" : "rgba(43,32,19,.05)"
                        };border:1px solid ${i === 0 ? "rgba(181,80,46,.3)" : "transparent"}`
                      )}
                    >
                      <span style={cssStyle("font-size:14px")}>{t.emoji}</span>
                      <span style={cssStyle("font-size:12.5px;color:var(--ink)")}>{t.name}</span>
                    </div>
                  ))}
                </div>
                <p style={cssStyle("margin:14px 0 0;font-size:12px;line-height:1.5;color:var(--ink-muted)")}>
                  {"More being made, one at a time."}
                </p>
              </div>

              {/* write it */}
              <div style={cssStyle(`${card};padding:20px`)}>
                <div style={cssStyle(label)}>{"WRITE IT"}</div>
                <div
                  style={cssStyle(
                    "margin-top:14px;padding:12px;border-radius:9px;background:#fdfaf2;border:1px solid rgba(43,32,19,.08)"
                  )}
                >
                  <div style={cssStyle("font-family:var(--hw-elegant),cursive;font-size:16px;line-height:1.5;color:#5c4830")}>
                    {"Mom,"}
                  </div>
                  <div style={cssStyle("margin-top:6px;display:grid;gap:5px")}>
                    <span style={cssStyle("height:1px;background:rgba(43,32,19,.12)")} />
                    <span style={cssStyle("height:1px;background:rgba(43,32,19,.12)")} />
                    <span style={cssStyle("height:1px;background:rgba(43,32,19,.12);width:62%")} />
                  </div>
                  {/* the nib, where the ink has got to */}
                  <motion.span
                    aria-hidden
                    style={cssStyle("display:inline-block;margin-top:8px;width:6px;height:6px;border-radius:50%;background:var(--rust)")}
                    animate={reduced ? undefined : { opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                </div>
                <p style={cssStyle("margin:14px 0 0;font-size:12px;line-height:1.5;color:var(--ink-muted)")}>
                  {"The ink arrives a word at a time, the way you wrote it."}
                </p>
              </div>
            </div>

            {/* send one link */}
            <div style={cssStyle(`${card};padding:22px;flex:1`)}>
              <div style={cssStyle("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap")}>
                <div style={cssStyle(label)}>{"SEND ONE LINK"}</div>
                <span
                  style={cssStyle(
                    "padding:4px 10px;border-radius:999px;background:rgba(107,133,74,.14);color:#4a6b3a;font-size:10.5px"
                  )}
                >
                  {"Private by default"}
                </span>
              </div>

              <div
                style={cssStyle(
                  "margin-top:16px;display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;background:#fdfaf2;border:1px solid rgba(43,32,19,.1)"
                )}
              >
                <span aria-hidden style={cssStyle("font-size:13px;color:var(--ink-faint)")}>{"🔗"}</span>
                <span
                  style={cssStyle(
                    "font-family:var(--font-ibm-plex-mono),monospace;font-size:12px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                  )}
                >
                  {"kindloop.com/g/quiet-harbour-071"}
                </span>
              </div>

              <div style={cssStyle("margin-top:16px;display:flex;flex-wrap:wrap;gap:8px")}>
                {["No app", "No account for them", "Opens anywhere", "Yours to delete"].map((t) => (
                  <span
                    key={t}
                    style={cssStyle(
                      "padding:5px 11px;border-radius:999px;background:rgba(43,32,19,.055);color:var(--ink-muted);font-size:11.5px"
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- right: the table you can rummage through ---------- */}
          <ChipTable />
        </div>
      </div>
    </section>
  );
}
