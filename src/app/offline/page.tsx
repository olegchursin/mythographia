import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function Offline() {
  return (
    <PageTransition className="page grid min-h-[80svh] place-items-center text-center">
      <div>
        <div className="meander meander-march mx-auto my-6 max-w-sm" />
        <h1 className="display display-sm">Across the Styx</h1>
        <p className="lede mx-auto mt-4">You are offline, and this page has not been read on this device yet. Articles you have already opened remain available.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Front page</Link>
        </div>
      </div>
    </PageTransition>
  );
}
