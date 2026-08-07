"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getTemplate, type TemplateId } from "@/lib/templates/registry";
import { fraunces, ibmPlexMono, spaceGrotesk } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { uploadFile } from "@/lib/clientUpload";
import { savePersonalization } from "./actions";
import { Breadcrumbs } from "@/app/Breadcrumbs";

export function CreateEditorClient({
  templateId,
  giftId,
  slug,
  isPaid,
  unlocked,
  priceCents,
  initialContent,
  accountMenu,
}: {
  templateId: TemplateId;
  giftId: string;
  slug: string;
  isPaid: boolean;
  unlocked: boolean;
  priceCents?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the resolved template's content type
  initialContent: any;
  /* Rendered on the server, since it reads the session. */
  accountMenu?: React.ReactNode;
}) {
  const router = useRouter();
  const def = getTemplate(templateId)!;
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const Editor = def.Editor;
  const View = def.View;
  const giftUrl = `/g/${slug}`;

  /**
   * Uploads go to /api/upload, not through a Server Action — actions cap the
   * request body at 1 MB, which almost any photo off a phone exceeds. Failures
   * are shown rather than thrown, so a rejected file never looks like a crash.
   */
  async function handleUpload(file: File) {
    setUploadError(null);
    try {
      return await uploadFile(giftId, file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Couldn't upload that file.");
      /* The editors treat an empty string as "nothing attached", so returning it
         leaves their state untouched instead of storing a broken reference. */
      return "";
    }
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await savePersonalization(giftId, content);
      setSaved(true);
      router.refresh();
    });
  }

  async function handleUnlock() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div
      className={`${theme.themeRoot} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} flex flex-1 flex-col items-center px-6 py-12`}
      style={{
        /* The same layered paper as the rest of the product — the editor used to
           be the one screen that looked like a different application. */
        background:
          "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
          "radial-gradient(circle at 72% 64%, rgba(122,92,52,.055) .6px, transparent .9px), " +
          "radial-gradient(ellipse 92% 48% at 50% -6%, rgba(226,186,124,.34), transparent 62%), " +
          "radial-gradient(ellipse 60% 38% at 92% 22%, rgba(190,104,64,.12), transparent 66%), " +
          "linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 32%, var(--bg1) 66%, var(--bg0) 100%)",
        backgroundSize: "39px 43px, 57px 51px, auto, auto, auto",
        color: "var(--ink-muted)",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        /* Said explicitly: this is a tool, and it keeps the system pointer no
           matter what a shared stylesheet decides later. */
        cursor: "auto",
      }}
    >
      <div
        className={
          def.fullWidthEditor
            ? "flex w-full max-w-7xl flex-col gap-8"
            : "grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2"
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
            {/* The way back out. This screen drops the site header on purpose —
                a marketing nav over unsaved work is an invitation to lose it —
                so the trail is the only route back, and it has to be here. */}
            <div className="mb-3">
              <Breadcrumbs
                items={[
                  { label: "Kindloop", href: "/" },
                  { label: "Experiences", href: "/templates" },
                  { label: def.displayName },
                ]}
              />
            </div>
            <h1
              className="m-0"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 500,
                fontSize: "clamp(26px,3vw,36px)",
                lineHeight: 1.1,
                letterSpacing: "-0.014em",
                color: "var(--ink)",
              }}
            >
              {def.displayName}
            </h1>
            <p className="m-0 mt-2 max-w-xl" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-muted)" }}>
              {def.description}
            </p>
            </div>
            {accountMenu}
          </div>

          <Editor value={content} onChange={setContent} uploadPhoto={handleUpload} />

          {uploadError && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl p-3.5"
              style={{ background: "#f7e3da", border: "1px solid rgba(138,58,30,.34)" }}
            >
              <p className="m-0 text-sm" style={{ color: "#8a3a1e" }}>{uploadError}</p>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                aria-label="Dismiss"
                className="cursor-pointer border-0 bg-transparent text-sm"
                style={{ color: "rgba(138,58,30,.7)" }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="cursor-pointer rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--brass)", color: "var(--on-dark)", border: "none" }}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            {saved && (
              <span className="text-xs" style={{ color: "#4a6b3a" }}>
                Saved
              </span>
            )}
          </div>

          {isPaid && !unlocked && (
            <div
              className="flex flex-col gap-3 rounded-xl p-4"
              style={{ background: "var(--khaki-pale)", border: "1px solid rgba(181,80,46,.3)" }}
            >
              <p className="m-0 text-sm" style={{ color: "var(--ink)" }}>
                This template costs ${((priceCents ?? 0) / 100).toFixed(2)}.
                Unlock it so the recipient can view the finished gift.
              </p>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={checkoutLoading}
                className="cursor-pointer self-start rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--rust)", color: "#fdf6e8", border: "none" }}
              >
                {checkoutLoading ? "Redirecting..." : "Unlock this template"}
              </button>
            </div>
          )}

          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)" }}
          >
            <p
              className="m-0"
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 9.5,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--label-on-paper)",
              }}
            >
              Share link
            </p>
            <a
              href={giftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block font-medium underline"
              style={{ color: "var(--ink)" }}
            >
              {giftUrl}
            </a>
          </div>
        </div>

        {!def.fullWidthEditor && (
          <div
            className="flex flex-col items-center overflow-hidden rounded-2xl"
            style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)" }}
          >
            <View content={content} embedded />
          </div>
        )}
      </div>
    </div>
  );
}
