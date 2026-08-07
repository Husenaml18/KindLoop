import { redirect } from "next/navigation";
import Link from "next/link";
import { fraunces, ibmPlexMono, spaceGrotesk, gochiHand } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { SiteHeader } from "@/app/SiteHeader";
import { SiteFooter } from "@/app/SiteFooter";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { initialsFor } from "@/lib/initials";
import { getTemplate } from "@/lib/templates/registry";
import { deleteAccount, deleteGift } from "./actions";
import { DangerZone } from "./DangerZone";
import { ProfileGifts, type ProfileGift } from "./ProfileGifts";
import { ProfileDetails } from "./ProfileDetails";
import { PageContainer } from "@/app/PageContainer";

export const metadata = { title: "Your profile — Kindloop" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Written the same way for everyone, rather than by the server's locale. */
function writtenDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default async function AccountPage(props: PageProps<"/account">) {
  const user = await requireUser();
  if (!user) redirect("/sign-in?callbackUrl=/account");

  const searchParams = await props.searchParams;
  const confirmFailed = searchParams.error === "confirm";

  const [gifts, oauth] = await Promise.all([
    prisma.gift.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: "desc" } }),
    prisma.account.findFirst({ where: { userId: user.id }, select: { provider: true } }),
  ]);

  const rows: ProfileGift[] = gifts.map((g) => ({
    id: g.id,
    slug: g.slug,
    template: g.template,
    name: getTemplate(g.template)?.displayName ?? g.template,
    locked: g.isPaid && !g.unlocked,
    updated: writtenDate(g.updatedAt),
  }));

  const distinctTemplates = new Set(gifts.map((g) => g.template)).size;
  const ready = rows.filter((r) => !r.locked).length;

  const stats: [string, string][] = [
    [String(gifts.length), gifts.length === 1 ? "Gift made" : "Gifts made"],
    [String(distinctTemplates), distinctTemplates === 1 ? "Experience" : "Experiences"],
    [String(ready), "Ready to send"],
    [writtenDate(user.createdAt).split(" ").slice(1).join(" "), "Joined"],
  ];

  const label = {
    fontFamily: "var(--font-ibm-plex-mono), monospace",
    fontSize: 9,
    letterSpacing: ".18em",
    textTransform: "uppercase" as const,
  };

  return (
    <div
      className={`${theme.themeRoot} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} flex flex-1 flex-col`}
      style={{
        background: "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
          "radial-gradient(circle at 72% 64%, rgba(122,92,52,.055) .6px, transparent .9px), " +
          "radial-gradient(ellipse 92% 48% at 50% -6%, rgba(226,186,124,.34), transparent 62%), " +
          "radial-gradient(ellipse 60% 38% at 92% 22%, rgba(190,104,64,.12), transparent 66%), " +
          "linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 32%, var(--bg1) 66%, var(--bg0) 100%)",
        backgroundSize: "39px 43px, 57px 51px, auto, auto, auto",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        color: "var(--ink-muted)",
        cursor: "auto",
        minHeight: "100dvh",
      }}
    >
      {/*
        No badge in the bar on this page.

        The profile already shows the seal, larger and with the name beside it —
        two avatars for the same person on one screen is confusing anywhere, and
        on a phone they end up almost adjacent. The menu behind the badge is not
        lost: everything in it is either on this page already or in the footer.
      */}
      <SiteHeader signedIn />

      {/* ---------- the cover ---------- */}
      <div
        className="relative"
        style={{
          height: "clamp(130px, 18vw, 190px)",
          /* Kraft, as a torn strip — not the near-black band it was. The dark
             version fought everything around it once the page became paper. */
          background:
            "radial-gradient(ellipse 64% 110% at 82% 8%, rgba(240,206,146,.5), transparent 62%), " +
            "repeating-linear-gradient(94deg, rgba(122,92,52,.05) 0 1px, transparent 1px 5px), " +
            "linear-gradient(158deg, #d3bd9a, #bfa47e)",
          overflow: "hidden",
        }}
      >
        {/* a wash of the same paper the gifts are made of */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(102deg, rgba(255,236,190,.05) 0 2px, transparent 2px 14px)",
          }}
        />
        {/* torn along the bottom, so the strip reads as paper laid on the page */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 13,
            background: "var(--bg2)",
            WebkitMaskImage: "radial-gradient(circle at 7px 12px, #000 6.4px, transparent 6.6px)",
            maskImage: "radial-gradient(circle at 7px 12px, #000 6.4px, transparent 6.6px)",
            WebkitMaskSize: "15px 13px",
            maskSize: "15px 13px",
            WebkitMaskRepeat: "repeat-x",
            maskRepeat: "repeat-x",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: "6%",
            bottom: "-40px",
            width: 190,
            height: 190,
            borderRadius: "50%",
            border: "10px solid rgba(255,226,168,.09)",
            transform: "scale(1.06,.85) rotate(-7deg)",
          }}
        />
      </div>

      {/* `relative` + a z-index, or the positioned cover above paints over the
          seal that deliberately overlaps it. */}
      <PageContainer as="main" className="relative z-10 flex-1 pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* ---------- left: who they are ---------- */}
          <div>
            {/* the seal, overlapping the cover the way an avatar does */}
            <div
              aria-hidden
              className="flex items-center justify-center rounded-full"
              style={{
                width: 104,
                height: 104,
                marginTop: -52,
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: ".04em",
                color: "#fdf6e8",
                background: "radial-gradient(circle at 34% 28%, #b5502e, #8a3a1e 62%, #6b2b14)",
                border: "5px solid var(--bg0)",
                boxShadow: "0 14px 30px -14px rgba(90,30,12,.8), inset 0 2px 4px rgba(255,255,255,.3)",
              }}
            >
              {initialsFor(user.name, user.email)}
            </div>

            <h1
              className="m-0 mt-5"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 500,
                fontSize: "clamp(26px,3vw,34px)",
                lineHeight: 1.1,
                color: "var(--ink)",
              }}
            >
              {user.name ?? "Your profile"}
            </h1>
            <p className="m-0 mt-1" style={{ fontSize: 14, color: "var(--ink-faint)" }}>
              {user.email}
            </p>

            {user.bio && (
              <p className="m-0 mt-4" style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-muted)" }}>
                {user.bio}
              </p>
            )}

            {/* ---------- what they've made ---------- */}
            <div
              className="mt-6 grid grid-cols-2 rounded-2xl"
              style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)", overflow: "hidden" }}
            >
              {stats.map(([value, name], i) => (
                <div
                  key={name}
                  className="px-4 py-4"
                  style={{
                    borderRight: i % 2 === 0 ? "1px solid rgba(43,32,19,.09)" : "none",
                    borderBottom: i < 2 ? "1px solid rgba(43,32,19,.09)" : "none",
                  }}
                >
                  <p
                    className="m-0"
                    style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 21, color: "var(--ink)" }}
                  >
                    {value}
                  </p>
                  <p className="m-0 mt-0.5" style={{ ...label, color: "var(--ink-faint)" }}>
                    {name}
                  </p>
                </div>
              ))}
            </div>

            {/* ---------- badges ---------- */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "var(--khaki-pale)", color: "var(--ink)", fontSize: 12 }}
              >
                <span aria-hidden>✦</span> Member since {writtenDate(user.createdAt)}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(61,37,23,.08)", color: "var(--ink-muted)", fontSize: 12 }}
              >
                <span aria-hidden>{oauth ? "◎" : "✉"}</span>
                {oauth ? `Signs in with ${oauth.provider}` : "Signs in by email"}
              </span>
            </div>

            <div className="mt-8">
              <ProfileDetails name={user.name ?? ""} bio={user.bio ?? ""} gender={user.gender ?? ""} />
            </div>

            <div className="mt-6">
              <DangerZone
                giftCount={gifts.length}
                confirmFailed={confirmFailed}
                deleteAccountAction={deleteAccount}
              />
            </div>
          </div>

          {/* ---------- right: what they've made ---------- */}
          <div id="gifts" className="scroll-mt-24 pt-8 lg:pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  className="m-0"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontWeight: 500,
                    fontSize: 25,
                    color: "var(--ink)",
                  }}
                >
                  Your gifts
                </h2>
                <p className="m-0 mt-1" style={{ fontSize: 13.5 }}>
                  {rows.length === 0
                    ? "Nothing here yet. The first one takes about ten minutes."
                    : "Each one has its own private link."}
                </p>
              </div>
              {/* "Make another" to somebody who has never made one is the product
                  talking to a customer it hasn't got. */}
              <Link
                href="/templates"
                className="rounded-full px-5 py-2.5 no-underline"
                style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 13.5, fontWeight: 500 }}
              >
                {rows.length === 0 ? "Make your first one" : "Make another"}
              </Link>
            </div>

            <ProfileGifts gifts={rows} deleteAction={deleteGift} />
          </div>
        </div>
      </PageContainer>

      <SiteFooter waitlist={false} />
    </div>
  );
}
