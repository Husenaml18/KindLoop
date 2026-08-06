import { redirect } from "next/navigation";

/**
 * The gift list now lives on the profile, beside who it belongs to.
 *
 * Kept as a redirect rather than deleted: the link is in emails, menus and
 * anywhere anybody has already bookmarked it, and two pages listing the same
 * gifts is how they drift apart.
 */
export default function DashboardPage() {
  redirect("/account");
}
