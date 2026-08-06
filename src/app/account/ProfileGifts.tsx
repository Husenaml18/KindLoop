"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TemplateArt } from "@/app/TemplateArt";
import { GiftRowActions } from "@/app/dashboard/GiftRowActions";

export interface ProfileGift {
  id: string;
  slug: string;
  template: string;
  name: string;
  locked: boolean;
  updated: string;
}

/**
 * Their gifts, filtered by a row of tabs.
 *
 * Counts live in the tabs themselves rather than in a separate summary — the
 * number and the way to see those things should be the same control, not two.
 */
export function ProfileGifts({
  gifts,
  deleteAction,
}: {
  gifts: ProfileGift[];
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"all" | "ready" | "locked">("all");

  const tabs = useMemo(
    () => [
      { id: "all" as const, label: "All", count: gifts.length },
      { id: "ready" as const, label: "Ready to send", count: gifts.filter((g) => !g.locked).length },
      { id: "locked" as const, label: "Locked", count: gifts.filter((g) => g.locked).length },
    ],
    [gifts]
  );

  const shown = gifts.filter((g) => (tab === "all" ? true : tab === "locked" ? g.locked : !g.locked));

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-1"
        style={{ borderBottom: "1px solid rgba(43,32,19,.14)", paddingBottom: 2 }}
        role="tablist"
        aria-label="Filter your gifts"
      >
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-3.5 py-3 text-[14px]"
              style={{
                color: on ? "var(--ink)" : "var(--ink-faint)",
                fontWeight: on ? 500 : 400,
                boxShadow: on ? "inset 0 -2px 0 var(--rust)" : "none",
              }}
            >
              {t.label}
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: on ? "var(--rust)" : "rgba(43,32,19,.09)",
                  color: on ? "#fdf6e8" : "var(--ink-faint)",
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div
          className="mt-8 rounded-2xl px-8 py-14 text-center"
          style={{ background: "var(--paper)", border: "1px dashed rgba(43,32,19,.2)" }}
        >
          <p className="m-0" style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 21, color: "var(--ink)" }}>
            {tab === "all" ? "Nothing made yet." : tab === "locked" ? "Nothing locked." : "Nothing ready yet."}
          </p>
          {tab === "all" && (
            <Link
              href="/templates"
              className="mt-5 inline-block rounded-full px-6 py-3 no-underline"
              style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14, fontWeight: 500 }}
            >
              Make your first one
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          {shown.map((g) => (
            <li
              key={g.id}
              className="flex flex-col overflow-hidden rounded-2xl"
              style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)" }}
            >
              <div className="relative" style={{ aspectRatio: "5 / 3", overflow: "hidden" }}>
                <TemplateArt id={g.template} alt={g.name} photos={[]} photoIndex={0} dim={g.locked} />
                <span
                  className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1"
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 9,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    background: g.locked ? "rgba(181,80,46,.9)" : "rgba(23,18,14,.78)",
                    color: "var(--paper)",
                  }}
                >
                  {g.locked ? "Locked" : "Ready"}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="m-0" style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17.5, color: "var(--ink)" }}>
                    {g.name}
                  </p>
                  <p
                    className="m-0 mt-0.5"
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 8.5,
                      letterSpacing: ".16em",
                      color: "var(--ink-faint)",
                    }}
                  >
                    {g.updated}
                  </p>
                </div>
                <GiftRowActions
                  giftId={g.id}
                  slug={g.slug}
                  template={g.template}
                  name={g.name}
                  deleteAction={deleteAction}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
