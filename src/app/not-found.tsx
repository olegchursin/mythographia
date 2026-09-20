import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitWords } from "@/components/motion/SplitWords";

export default function NotFound() {
  return (
    <PageTransition className="page grid min-h-[80svh] place-items-center text-center">
      <div>
        <p className="font-display text-[clamp(6rem,22vw,14rem)] font-bold leading-none text-gilded opacity-90">404</p>
        <div className="meander meander-march mx-auto my-6 max-w-sm" />
        <h1 className="display display-sm"><SplitWords text="Lost in the Labyrinth" /></h1>
        <p className="lede mx-auto mt-4">Nothing in the surviving sources answers to that name. Follow the thread back out.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/a-z" className="btn btn-primary">Browse the index</Link>
          <Link href="/" className="btn btn-ghost">Front page</Link>
        </div>
      </div>
    </PageTransition>
  );
}
