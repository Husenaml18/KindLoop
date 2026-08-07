import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, P, Plainly, Section } from "../LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy — Kindloop",
  description:
    "What Kindloop stores, who it is shared with, and how to get rid of all of it.",
};

/**
 * Written from the schema and the code, not from a template.
 *
 * Every claim here is checkable against something in the repository — the columns
 * in `prisma/schema.prisma`, the cookies set in `src/lib`, the outbound calls in
 * `src/lib/giftPhotos.ts` and `src/lib/mail.ts`. A privacy policy that describes a
 * product other than the one that shipped is worse than none, because it is a
 * promise nobody is keeping.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      active="/legal/privacy"
      title="Privacy policy"
      summary="What we store, who else sees it, and how to get rid of all of it. Kindloop holds letters people wrote to each other, so this is written specifically rather than generically."
    >
      <Section n="01" title="The short version">
        <Bullets
          items={[
            <>
              <strong>We do not read your gifts.</strong> There is no interface
              anywhere in Kindloop for opening somebody else&apos;s — not for staff,
              not for anyone. That is a design decision, not a policy.
            </>,
            <>
              <strong>We do not track who opens what.</strong> Nothing records that a
              gift was viewed, when, or by whom. The person you send it to leaves no
              trace, and you cannot find out either.
            </>,
            <>
              <strong>There is no analytics, no advertising, no third-party
              tracking.</strong> No Google Analytics, no pixels, no session recording.
            </>,
            <>
              <strong>We never sell anything to anyone.</strong> There is no
              circumstance in which your data is a product.
            </>,
          ]}
        />
      </Section>

      <Section n="02" title="What we store about you">
        <P>If you make an account, we hold:</P>
        <Bullets
          items={[
            "Your email address — needed to send the sign-in link, and to reach you about your own account.",
            "Your name, if you gave one — used to sign the gifts you make.",
            "Anything else you chose to fill in: a line about yourself, and a gender field that is optional, free-text, and read by nothing in the product.",
            "A profile picture, only if you signed in with Google and it supplied one.",
            "When the account was created and last changed.",
          ]}
        />
        <P>And for the things you make:</P>
        <Bullets
          items={[
            "The content of each gift — your words, and links to the photographs, recordings or video you uploaded.",
            "Its private link, which template it uses, and whether it has been paid for.",
            "Uploaded files themselves, kept so the gift can be shown to whoever opens the link.",
          ]}
        />
        <P>
          If you join the waitlist, we hold that address and which page you were on
          when you asked — and nothing else.
        </P>
      </Section>

      <Section n="03" title="What we do not store">
        <Bullets
          items={[
            "Passwords. There are none — sign-in is a one-time link and code.",
            "Card details. Payments go to Stripe; we never see a card number.",
            "Any record of a gift being opened, by whom, when, or how often.",
            "Any contact details for the person you send a gift to. We never learn who they are — you send them the link yourself.",
          ]}
        />
        <Plainly>
          The recipient of a Kindloop gift is invisible to us. We have no account for
          them, no address for them, and no log that they were ever here.
        </Plainly>
      </Section>

      <Section n="04" title="Who else is involved">
        <P>
          Running this at all means a handful of companies handle some of it. Each one
          does a specific job, and none of them get it for their own purposes:
        </P>
        <Bullets
          items={[
            <><strong>Vercel</strong> — hosting. Handles every request, which means the usual server logs: an IP address, a page, a timestamp.</>,
            <><strong>Prisma Postgres</strong> — the database your account and your gifts are stored in.</>,
            <><strong>Your email provider</strong> — we send sign-in emails through an SMTP server, so that provider handles the address and the message.</>,
            <><strong>Stripe</strong> — only if you buy a paid experience, and only what a payment needs.</>,
            <><strong>Pexels</strong> — stock photographs shown as examples on our own marketing pages. Nothing of yours is sent there.</>,
          ]}
        />
        <P>
          That is the whole list. There is no advertising network, no data broker, and
          no analytics provider on it.
        </P>
      </Section>

      <Section n="05" title="How long it is kept">
        <P>
          Your gifts stay for as long as you want them. Nothing expires on its own and
          nothing is deleted for being old. Sign-in links and codes expire after
          fifteen minutes and are single-use.
        </P>
        <P>
          When you delete a gift, its content and its uploaded files go with it. When
          you delete your account, everything you made goes with it. We do not keep a
          copy, and there is no thirty-day grace period in which we quietly still have
          it — so be sure before you press the button.
        </P>
      </Section>

      <Section n="06" title="Your rights over it">
        <P>
          Depending on where you live you may have a legal right to see what we hold,
          correct it, take it elsewhere, or have it erased. You do not need to invoke
          a regulation to use any of that here:
        </P>
        <Bullets
          items={[
            "Correct it — your name, bio and everything optional are editable on your profile.",
            "Erase it — deleting a gift or your account does it immediately, yourself.",
            <>
              See or export it — ask us at{" "}
              <Link href="/contact" style={{ color: "var(--rust)" }}>
                the contact page
              </Link>{" "}
              and we will send you what we hold.
            </>,
          ]}
        />
        <P>
          Our legal basis is straightforward: we process your account details to
          provide a service you asked for, and we keep what the law requires us to
          keep for payments. Nothing here relies on legitimate interest for marketing,
          because there is no marketing.
        </P>
      </Section>

      <Section n="07" title="Security, honestly stated">
        <P>
          Gift links end in a random string rather than a number that counts upwards,
          so there is nothing to guess your way through. Traffic is encrypted. Sign-in
          tokens are hashed and single-use.
        </P>
        <P>
          What that does not mean: a Kindloop link is unlisted, not secret. Anybody
          who has the link can open the gift. Send it the way you would send anything
          private, and delete it if it ends up somewhere you did not intend.
        </P>
      </Section>

      <Section n="08" title="Children">
        <P>
          Kindloop is not designed for children and we do not knowingly hold data
          about anyone under 13, or under 16 where that is the local threshold. If you
          believe a child has made an account, tell us and we will remove it.
        </P>
      </Section>
    </LegalPage>
  );
}
