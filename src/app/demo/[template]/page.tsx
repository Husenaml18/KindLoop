import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates/registry";
import { TEMPLATE_DEMOS } from "@/lib/templates/demos";
import { DemoFrame } from "./DemoFrame";
import { TemplateFonts } from "@/app/TemplateFonts";

export async function generateMetadata(props: PageProps<"/demo/[template]">): Promise<Metadata> {
  const { template } = await props.params;
  const def = getTemplate(template);
  if (!def) return { title: "Demo — Kindloop" };
  return {
    title: `${def.displayName} — a Kindloop walkthrough`,
    description: def.description,
  };
}

export default async function DemoPage(props: PageProps<"/demo/[template]">) {
  const { template } = await props.params;

  const def = getTemplate(template);
  const raw = TEMPLATE_DEMOS[template];
  if (!def || raw === undefined) notFound();

  // Validate the demo through the template's own schema so a stale sample can
  // never render a half-broken experience.
  const parsed = def.contentSchema.safeParse(raw);
  if (!parsed.success) notFound();

  return (
    <TemplateFonts>
      <DemoFrame
        View={def.View as never}
        content={parsed.data}
        templateName={def.displayName}
        createHref={`/create/${def.id}`}
      />
    </TemplateFonts>
  );
}
