"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "../fonts";
import { FountainPenCursor } from "../FountainPenCursor";
import { cssStyle } from "@/lib/uiStyle";
import { TemplateArt } from "@/app/TemplateArt";
import { Wordmark } from "@/app/Wordmark";
import {
  CATEGORIES,
  TEMPLATE_CATALOG,
  uniqueOccasions,
  uniqueRecipients,
  type CatalogTemplate,
  type CategoryId,
} from "@/lib/templateCatalog";
import { Dropdown } from "./Dropdown";
import styles from "../landing.module.css";
import theme from "../theme.module.css";

const TRUST_BADGES = [
  { icon: "🔒", label: "Private by default" },
  { icon: "📱", label: "No app needed" },
  { icon: "⚡", label: "Ready in minutes" },
  { icon: "🗑️", label: "Delete any time" },
  { icon: "✨", label: "Free to start" },
];

type SortMode = "featured" | "category" | "az" | "quickest";

const STATUS_LABEL: Record<CatalogTemplate["status"], string> = {
  available: "Available now",
  soon: "In the workshop",
  horizon: "On the horizon",
};

const STATUS_RANK: Record<CatalogTemplate["status"], number> = {
  available: 0,
  soon: 1,
  horizon: 2,
};

const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
const CATEGORY_ORDER = new Map(CATEGORIES.map((c, i) => [c.id, i]));

/**
 * Deal one card from each category in turn, so the default grid reads as a
 * genuine mix instead of silently clustering by collection. Deterministic —
 * no randomness, so server and client agree.
 */
function interleaveByCategory(list: CatalogTemplate[]): CatalogTemplate[] {
  const buckets = new Map<CategoryId, CatalogTemplate[]>();
  for (const t of list) {
    const bucket = buckets.get(t.category);
    if (bucket) bucket.push(t);
    else buckets.set(t.category, [t]);
  }
  const queues = CATEGORIES.map((c) => buckets.get(c.id) ?? []).filter((q) => q.length > 0);

  const out: CatalogTemplate[] = [];
  let round = 0;
  while (out.length < list.length) {
    let placedThisRound = false;
    for (const q of queues) {
      if (round < q.length) {
        out.push(q[round]);
        placedThisRound = true;
      }
    }
    if (!placedThisRound) break;
    round += 1;
  }
  return out;
}

function ExperienceCard({
  template,
  photos,
  photoIndex,
}: {
  template: CatalogTemplate;
  photos: string[];
  photoIndex: number;
}) {
  const live = template.status === "available";
  const category = CATEGORY_BY_ID.get(template.category);

  return (
    <div
      className={styles.galleryCard}
      style={cssStyle(
        "position:relative;display:flex;flex-direction:column;height:100%;border-radius:12px;overflow:hidden;background:var(--paper);border:1px solid rgba(43,38,32,.1);transition:transform .25s ease,box-shadow .25s ease"
      )}
    >
      {/* 5:4 rather than a fixed height: the artwork is square, so the old 142px
            band cropped away more than half of every composition. */}
      <div style={cssStyle("position:relative;aspect-ratio:5 / 4;overflow:hidden")}>
        <TemplateArt
          id={template.id}
          alt={`${template.name} — ${template.blurb}`}
          photos={photos}
          photoIndex={photoIndex}
          dim={!live}
        />
        {!live && <div aria-hidden style={cssStyle("position:absolute;inset:0;background:rgba(23,18,14,.42)")} />}
        <span
          style={cssStyle(
            `position:absolute;left:10px;top:10px;padding:4px 10px;border-radius:999px;font-family:var(--font-ibm-plex-mono),monospace;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;background:${
              live ? "rgba(23,18,14,.8)" : "rgba(23,18,14,.66)"
            };color:var(--paper)`
          )}
        >
          {live ? template.price : STATUS_LABEL[template.status]}
        </span>
        {/* the grid is mixed, so each card names its own collection */}
        {category && (
          <span
            style={cssStyle(
              "position:absolute;right:10px;top:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;font-size:10.5px;background:rgba(242,233,212,.92);color:var(--ink)"
            )}
          >
            <span>{category.emoji}</span>
            {category.label}
          </span>
        )}
      </div>

      <div style={cssStyle("display:flex;flex-direction:column;gap:9px;padding:15px 16px 17px;flex:1")}>
        <div style={cssStyle("display:flex;align-items:center;gap:8px")}>
          <span style={cssStyle("font-size:19px")}>{template.emoji}</span>
          <span style={cssStyle("font-family:var(--font-fraunces),serif;font-size:19px;color:var(--ink)")}>
            {template.name}
          </span>
        </div>

        <p style={cssStyle("margin:0;font-size:13.5px;line-height:1.55;color:var(--ink-muted)")}>{template.blurb}</p>

        <div style={cssStyle("display:flex;flex-direction:column;gap:5px;margin-top:2px")}>
          <span
            style={cssStyle(
              "font-family:var(--font-ibm-plex-mono),monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--label-on-paper)"
            )}
          >
            Like · {template.inspiration}
          </span>
          <span style={cssStyle("font-size:12.5px;line-height:1.5;color:var(--ink-faint)")}>
            {template.interaction}
          </span>
        </div>

        <div style={cssStyle("display:flex;flex-wrap:wrap;gap:6px;margin-top:4px")}>
          {template.occasions.slice(0, 2).map((o) => (
            <span
              key={o}
              style={cssStyle(
                "padding:3px 9px;border-radius:999px;border:1px solid rgba(43,38,32,.14);font-size:11px;color:var(--ink-muted)"
              )}
            >
              {o}
            </span>
          ))}
          <span
            style={cssStyle(
              "padding:3px 9px;border-radius:999px;background:var(--paper-muted);font-family:var(--font-ibm-plex-mono),monospace;font-size:10.5px;color:var(--ink)"
            )}
          >
            {template.estimate}
          </span>
        </div>

        <div style={cssStyle("display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:12px")}>
          {template.demo && (
            <Link
              href={`/demo/${template.id}`}
              style={cssStyle(
                "display:inline-flex;align-items:center;padding:9px 15px;border-radius:999px;background:var(--deep);color:var(--paper);font-size:12px;font-weight:600;text-decoration:none"
              )}
            >
              ▶ Watch the demo
            </Link>
          )}
          {live ? (
            <Link
              href={template.href}
              style={cssStyle(
                `display:inline-flex;align-items:center;padding:9px 15px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;${
                  template.demo
                    ? "border:1px solid rgba(43,38,32,.22);color:var(--ink)"
                    : "background:var(--deep);color:var(--paper)"
                }`
              )}
            >
              Start creating →
            </Link>
          ) : (
            <span
              style={cssStyle(
                "display:inline-flex;align-items:center;padding:9px 15px;border-radius:999px;border:1px dashed rgba(43,38,32,.22);font-size:12px;color:var(--ink-faint)"
              )}
            >
              {template.status === "horizon" ? "Being designed" : "Coming soon"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplatesGallery({ photos }: { photos: string[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("featured");
  const [category, setCategory] = useState("");
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [availability, setAvailability] = useState("");

  const occasionOptions = useMemo(() => uniqueOccasions(), []);
  const recipientOptions = useMemo(() => uniqueRecipients(), []);

  const anyFilter = Boolean(query.trim() || category || occasion || recipient || availability);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = TEMPLATE_CATALOG.filter((t) => {
      const inQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.theme.toLowerCase().includes(q) ||
        t.inspiration.toLowerCase().includes(q) ||
        t.occasions.some((o) => o.toLowerCase().includes(q));
      const inCategory = !category || t.category === category;
      const inOccasion = !occasion || t.occasions.includes(occasion);
      const inRecipient = !recipient || t.recipients.includes(recipient);
      const inAvailability = !availability || STATUS_LABEL[t.status] === availability;
      return inQuery && inCategory && inOccasion && inRecipient && inAvailability;
    });

    if (sort === "az") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "quickest") {
      return [...filtered].sort((a, b) => parseInt(a.estimate, 10) - parseInt(b.estimate, 10));
    }
    if (sort === "category") {
      return [...filtered].sort(
        (a, b) =>
          (CATEGORY_ORDER.get(a.category) ?? 0) - (CATEGORY_ORDER.get(b.category) ?? 0) ||
          STATUS_RANK[a.status] - STATUS_RANK[b.status]
      );
    }
    // featured: ready-to-use first, then a genuine mix across collections
    const bands = ([0, 1, 2] as const).map((rank) =>
      interleaveByCategory(filtered.filter((t) => STATUS_RANK[t.status] === rank))
    );
    return bands.flat();
  }, [query, sort, category, occasion, recipient, availability]);

  const photoIndexOf = (t: CatalogTemplate) => TEMPLATE_CATALOG.findIndex((x) => x.id === t.id);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setOccasion("");
    setRecipient("");
    setAvailability("");
    setSort("featured");
  };

  return (
    <div
      className={`${theme.themeRoot} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable}`}
      style={{
        position: "relative",
        minHeight: "100%",
        background:
          "linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 12%, var(--bg0) 28%, var(--bg2) 44%, var(--bg1) 62%, var(--bg0) 80%, var(--bg1) 100%)",
        color: "var(--cream-muted)",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <FountainPenCursor />

      <header style={cssStyle("padding:16px 28px")}>
        <Link href="/" aria-label="Kindloop — home" style={{ display: "inline-block" }}>
          <Wordmark size={26} priority />
        </Link>
      </header>

      <div style={cssStyle("max-width:1200px;margin:0 auto;padding:24px 28px 96px")}>
        <div style={cssStyle("text-align:center;max-width:660px;margin:0 auto")}>
          <h1
            style={cssStyle(
              "margin:0;font-family:var(--font-fraunces),serif;font-weight:500;font-size:clamp(32px,4vw,50px);line-height:1.08;letter-spacing:-.014em;color:var(--cream)"
            )}
          >
            Choose an experience
          </h1>
          <p style={cssStyle("margin:14px 0 0;font-size:16px;line-height:1.6;color:var(--cream-muted)")}>
            Not templates — experiences, each built for a different feeling. Start
            with the moment you have in mind.
          </p>
        </div>

        <div
          style={cssStyle(
            "margin-top:36px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px"
          )}
        >
          {TRUST_BADGES.map((b) => (
            <div
              key={b.label}
              style={cssStyle(
                "display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 10px;border-radius:10px;background:var(--paper);border:1px solid rgba(43,38,32,.1);text-align:center"
              )}
            >
              <span style={cssStyle("font-size:20px")}>{b.icon}</span>
              <span style={cssStyle("font-size:12.5px;font-weight:600;color:var(--ink)")}>{b.label}</span>
            </div>
          ))}
        </div>

        <div style={cssStyle("margin-top:32px")}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences… birthday, mom, proposal, cassette"
            aria-label="Search experiences"
            style={cssStyle(
              "width:100%;padding:14px 18px;border-radius:10px;border:1px solid rgba(43,38,32,.16);background:var(--paper);color:var(--ink);font-size:15px;font-family:var(--font-space-grotesk),sans-serif"
            )}
          />
          <div style={cssStyle("margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center")}>
            <Dropdown
              label="Sort"
              allLabel="Sort: Featured"
              value={sort === "featured" ? "" : sort}
              onChange={(v) => setSort((v || "featured") as SortMode)}
              options={[
                { value: "category", label: "Sort: By collection" },
                { value: "az", label: "Sort: A–Z" },
                { value: "quickest", label: "Sort: Quickest first" },
              ]}
            />
            <Dropdown
              label="Category"
              allLabel="All collections"
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.label, glyph: c.emoji }))}
            />
            <Dropdown
              label="Occasion"
              allLabel="All occasions"
              value={occasion}
              onChange={setOccasion}
              options={occasionOptions.map((o) => ({ value: o, label: o }))}
            />
            <Dropdown
              label="Recipient"
              allLabel="Any recipient"
              value={recipient}
              onChange={setRecipient}
              options={recipientOptions.map((r) => ({ value: r, label: r }))}
            />
            <Dropdown
              label="Availability"
              allLabel="All availability"
              value={availability}
              onChange={setAvailability}
              options={[
                { value: "Available now", label: "Available now" },
                { value: "In the workshop", label: "In the workshop" },
                { value: "On the horizon", label: "On the horizon" },
              ]}
            />
            {anyFilter && (
              <button
                type="button"
                onClick={clearAll}
                style={cssStyle(
                  "padding:12px 15px;border-radius:8px;cursor:pointer;font-size:13px;background:transparent;border:1px solid rgba(43,38,32,.16);color:var(--ink-muted);font-family:var(--font-space-grotesk),sans-serif"
                )}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <p
          aria-live="polite"
          style={cssStyle(
            "margin-top:24px;font-family:var(--font-ibm-plex-mono),monospace;font-size:12px;letter-spacing:.08em;color:var(--label-on-dark);text-transform:uppercase"
          )}
        >
          {results.length} experience{results.length === 1 ? "" : "s"}
          {anyFilter ? " matching" : ` across ${CATEGORIES.length} collections`}
        </p>

        <div
          style={cssStyle(
            "margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:20px"
          )}
        >
          {results.map((t) => (
            <ExperienceCard key={t.id} template={t} photos={photos} photoIndex={photoIndexOf(t)} />
          ))}
        </div>

        {results.length === 0 && (
          <p style={cssStyle("margin-top:48px;text-align:center;color:var(--cream-muted)")}>
            Nothing matches those filters yet — try clearing one.
          </p>
        )}
      </div>
    </div>
  );
}
