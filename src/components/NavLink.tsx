"use client";

import Link, { useLinkStatus } from "next/link";

/** A filter chip that is a real link: URL-driven state, with a pulse while the server round-trip is in flight. */
export function ChipLink({ href, active, children, className = "", scroll = false, title }: { href: string; active?: boolean; children: React.ReactNode; className?: string; scroll?: boolean; title?: string }) {
  return (
    <Link href={href} scroll={scroll} title={title} aria-current={active ? "true" : undefined} className={`inline-flex rounded-full ${className}`}>
      <ChipBody active={active}>{children}</ChipBody>
    </Link>
  );
}

function ChipBody({ active, children }: { active?: boolean; children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className="chip" data-active={!!active} data-pending={pending}>{children}</span>;
}
