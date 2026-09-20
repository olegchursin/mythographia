"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  name?: string;
  tw: number;
}

/** Hero backdrop: named figures drift as stars and link to their neighbours; the cursor gathers lines toward it. */
export function HeroConstellation({ names }: { names: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999 };
    let w = 0, h = 0, raf = 0, visible = true, stars: Star[] = [];
    let gold = "227,193,111", ink = "242,234,217", font = "system-ui";

    const readTheme = () => {
      const light = document.documentElement.dataset.theme === "light";
      gold = light ? "143,109,16" : "227,193,111";
      ink = light ? "31,27,22" : "242,234,217";
      font = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim() || "system-ui";
    };

    const seed = () => {
      const count = Math.round(Math.min(110, Math.max(45, (w * h) / 14000)));
      stars = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: i < names.length ? 2.1 : Math.random() * 1.1 + 0.4,
        name: i < names.length && i % 2 === 0 ? names[i] : undefined,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduce) draw(0);
    };

    const LINK = 150;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < -20) s.x = w + 20; else if (s.x > w + 20) s.x = -20;
          if (s.y < -20) s.y = h + 20; else if (s.y > h + 20) s.y = -20;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK) continue;
          const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - pointer.x, (a.y + b.y) / 2 - pointer.y) / 260);
          ctx.strokeStyle = `rgba(${gold},${(1 - d / LINK) * (0.13 + near * 0.55)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < 200) {
          ctx.strokeStyle = `rgba(${gold},${(1 - pd / 200) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.font = `500 11px ${font}, sans-serif`;
      for (const s of stars) {
        const twinkle = 0.55 + Math.sin(t / 900 + s.tw) * 0.35;
        const near = Math.max(0, 1 - Math.hypot(s.x - pointer.x, s.y - pointer.y) / 220);
        ctx.fillStyle = `rgba(${s.name || s.r > 2 ? gold : ink},${Math.min(1, twinkle + near)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + near * 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (s.name) {
          ctx.fillStyle = `rgba(${ink},${0.2 + near * 0.75})`;
          ctx.fillText(s.name.toUpperCase(), s.x + 9, s.y + 4);
        }
      }
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    readTheme();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readTheme();
      if (reduce) draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [names]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full [mask-image:radial-gradient(90%_80%_at_50%_45%,#000_35%,transparent)]" />;
}
