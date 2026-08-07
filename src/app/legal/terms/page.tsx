import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, P, Plainly, Section } from "../LegalPage";

export const metadata: Metadata = {
  title: "Terms of service — Kindloop",
  description: "What you can expect from Kindloop, and what we expect from you.",
};

export default function TermsPage() {
  return (
    <LegalPage
      active="/legal/terms"
      title="Terms of service"
      summary="What you can expect from us, and what we ask of you. Written to be read rather than skipped — if a clause here needs a lawyer to understand, that is our failing and worth telling us about."
    >
      <Section n="01" title="What Kindloop is">
        <P>
          Kindloop lets you make a digital gift — a letter, a scrapbook, a puzzle —
          and share it as a private link. Whoever you send it to opens it in a
          browser without an account, without an app, and without signing anything.
        </P>
        <P>
          You need an account only to <em>make</em> something, so that you can come
          back and edit it and so that nobody else can edit yours.
        </P>
      </Section>

      <Section n="02" title="Your account">
        <P>
          Signing in is passwordless. You give an email address, we send a link and a
          six-character code, and either one signs you in. That link works once and
          expires in fifteen minutes.
        </P>
        <Bullets
          items={[
            "Use an address you actually control. Anyone who can read that inbox can sign in as you.",
            "You must be old enough to agree to terms where you live — 13 at the least, and 16 in most of Europe. Kindloop is not built for children.",
            "One person, one account. Don't sign in as somebody else.",
          ]}
        />
      </Section>

      <Section n="03" title="What you make belongs to you">
        <P>
          You keep every right in the photographs, words, recordings and video you
          upload. We do not claim ownership of any of it, and we do not use it to
          train anything.
        </P>
        <P>
          You give us the narrow permission we need to actually run the service:
          storing your content, serving it to whoever opens your link, and making the
          copies needed to do that (resizing an image for a page, for instance). That
          permission ends when you delete the content or your account.
        </P>
        <Plainly>
          It stays yours. We hold it so the link works, and for no other reason.
        </Plainly>
      </Section>

      <Section n="04" title="What not to put in one">
        <P>
          Kindloop is for gifts. A short list of things it is not for, all of which
          will get an account closed:
        </P>
        <Bullets
          items={[
            "Anything sexual involving children, or anything that abuses or endangers one.",
            "Threats, harassment, or content made to frighten or humiliate the person receiving it.",
            "Anything unlawful where you or the recipient are — including content you have no right to share.",
            "Malware, phishing, or using a gift link to trick somebody into giving up credentials or money.",
            "Other people's private information — photographs, recordings, messages — shared without their agreement.",
          ]}
        />
        <P>
          There is deliberately no interface anywhere in Kindloop for reading somebody
          else&apos;s gift, so we do not monitor what you make. We act on what is
          reported to us. Report anything at{" "}
          <Link href="/contact" style={{ color: "var(--rust)" }}>
            our contact page
          </Link>
          .
        </P>
      </Section>

      <Section n="05" title="Money">
        <P>
          Most experiences are free, with no limit on how many you make. Some are a
          one-off charge for that gift — not a subscription. Nothing renews, and
          nothing you have already paid for stops working because you did not pay
          again.
        </P>
        <P>
          Payments are handled by Stripe. We never see or store your card details.
          Prices are shown before you pay, and you can build a paid experience in full
          and see exactly how it looks before unlocking it.
        </P>
        <Plainly>
          If a paid gift does not work as described, write to us and we will refund
          it. We would rather do that than argue about it.
        </Plainly>
      </Section>

      <Section n="06" title="Deleting things">
        <P>
          You can delete any gift, and your whole account, from your profile at any
          time. Deleting a gift takes its link and its uploaded files with it.
          Deleting your account removes everything you made.
        </P>
        <P>
          We may close an account that breaks section 4, or that we are legally
          required to close. Where we can, we will tell you why first.
        </P>
      </Section>

      <Section n="07" title="What we do not promise">
        <P>
          Kindloop is a small product, offered as it is. We do not promise it will be
          available without interruption, free of every bug, or preserved forever.
          Keep your own copy of anything you would be upset to lose — the photographs
          you upload should not be the only copies you have.
        </P>
        <P>
          To the extent the law allows, we are not liable for indirect or
          consequential loss. Nothing here limits liability that cannot be limited,
          including for death, personal injury, or fraud.
        </P>
      </Section>

      <Section n="08" title="Changes, and where this is decided">
        <P>
          If these terms change in a way that matters, we will say so on this page and
          update the date at the top. Continuing to use Kindloop after that means the
          new version applies.
        </P>
        <P>
          These terms are governed by the law of the place Kindloop is operated from,
          without affecting any rights you have as a consumer where you live.
        </P>
      </Section>
    </LegalPage>
  );
}
