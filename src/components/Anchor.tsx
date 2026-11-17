import type { AnchorHTMLAttributes } from "react";

/**
 * A link that opens in a new tab once it leaves the page.
 *
 * Jumps within the page (#work) and mailto: links keep the current tab: a
 * new tab would either break the jump or sit there empty. Everything else,
 * including the resume PDF, opens alongside so the page is not lost.
 */
export function Anchor({
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const leavesThePage = !href.startsWith("#") && !href.startsWith("mailto:");

  return (
    <a
      href={href}
      {...(leavesThePage ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...rest}
    />
  );
}
