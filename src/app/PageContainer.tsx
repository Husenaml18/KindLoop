import type { CSSProperties, ReactNode } from "react";

/**
 * One column width for the whole product.
 *
 * 1200px with a 28px gutter — the measurement the Templates gallery already used.
 * Pages that each pick their own width make the header appear to shift sideways as
 * you move between them: nobody names it, everybody notices it.
 *
 * The landing page is deliberately exempt. It is a poster rather than a document,
 * and its sections set their own widths for their own reasons.
 */
export const PAGE_WIDTH = 1200;

/** A comfortable line length for body copy inside that wide column. */
export const READ_WIDTH = 760;

export function PageContainer({
  children,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  as?: "div" | "main" | "section";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Tag
      className={`mx-auto w-full ${className}`}
      style={{ maxWidth: PAGE_WIDTH, paddingLeft: 28, paddingRight: 28, ...style }}
    >
      {children}
    </Tag>
  );
}
