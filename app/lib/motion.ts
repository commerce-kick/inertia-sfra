/**
 * Single home for JS-driven motion. anime.js is only ever loaded through
 * loadAnime() inside an effect, so the SSR bundle never evaluates it and
 * the client ships it as a lazy chunk on the pages that animate.
 *
 * This file itself ships in the SSR bundle — no browser APIs at module
 * scope, and prefersReducedMotion() may only be called inside effects or
 * event handlers.
 */
import { useEffect, type RefObject } from "react";

/** Numeric mirror of the --motion-* tokens in globals.css. */
export const MOTION = {
  fast: 150,
  base: 250,
  slow: 400,
  hero: 700,
  /** cubic-bezier(0.16, 1, 0.3, 1) — confident arrival, exponential-ish out. */
  ease: "cubicBezier(0.16, 1, 0.3, 1)",
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function loadAnime() {
  return import("./anime-lite");
}

/**
 * The masked reveal — the hero grammar, reusable. Inside the root it finds
 * [data-anim='line'] rows (rise from behind an overflow-hidden mask),
 * [data-anim='rule'] hairlines (draw scaleX 0→1 from the left) and
 * [data-anim='fade'] elements (settle in), and plays them as one timeline.
 *
 * Markup must render in its final state: the zero state is applied
 * synchronously inside the effect, so SSR, no-JS, and reduced-motion
 * visitors always see the finished composition. With `whenInView` the
 * reveal arms at mount and plays once when the root first enters the
 * viewport — the chapter-reveal device of DESIGN.md.
 */
export function useMaskedReveal(
  rootRef: RefObject<HTMLElement | null>,
  { whenInView = false }: { whenInView?: boolean } = {}
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const lines = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='line']")
    );
    const rules = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='rule']")
    );
    const fades = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='fade']")
    );
    if (!lines.length && !rules.length && !fades.length) return;

    // Zero state applied synchronously so nothing flashes while the lazy
    // anime.js chunk loads; restored verbatim if the import fails.
    for (const el of lines) el.style.transform = "translateY(110%)";
    for (const el of rules) el.style.transform = "scaleX(0)";
    for (const el of fades) el.style.opacity = "0";

    let cancelled = false;
    let played = false;
    let dispose: (() => void) | undefined;
    const restore = () => {
      for (const el of lines) el.style.transform = "";
      for (const el of rules) el.style.transform = "";
      for (const el of fades) el.style.opacity = "";
    };

    const play = () => {
      if (cancelled || played) return;
      played = true;
      loadAnime()
        .then(({ createTimeline, stagger }) => {
          if (cancelled) {
            restore();
            return;
          }
          const tl = createTimeline({ defaults: { ease: MOTION.ease } });
          if (lines.length) {
            tl.add(lines, {
              translateY: ["110%", "0%"],
              duration: MOTION.hero,
              delay: stagger(110),
            });
          }
          if (rules.length) {
            tl.add(
              rules,
              { scaleX: [0, 1], duration: MOTION.slow, delay: stagger(80) },
              lines.length ? "-=550" : 0
            );
          }
          if (fades.length) {
            tl.add(
              fades,
              {
                opacity: [0, 1],
                translateY: [8, 0],
                duration: MOTION.slow,
                delay: stagger(60),
              },
              lines.length || rules.length ? "-=350" : 0
            );
          }
          dispose = () => tl.pause();
        })
        .catch(restore);
    };

    let observer: IntersectionObserver | undefined;
    if (whenInView && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            play();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(root);
    } else {
      play();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      dispose?.();
      restore();
    };
  }, [rootRef, whenInView]);
}

/**
 * The mono ticker — a numeral counts up to its true value once, when the
 * element first enters the viewport. The markup renders the final value
 * (SSR, no-JS, and reduced-motion visitors only ever see the real number);
 * the rewind to zero happens the instant the animation starts, never
 * before. Pass null to leave a non-numeric value untouched.
 */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  value: number | null
) {
  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      value === null ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let cancelled = false;
    let dispose: (() => void) | undefined;
    const settle = () => {
      el.textContent = String(value);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadAnime()
          .then(({ animate }) => {
            if (cancelled) return;
            const counter = { n: 0 };
            const animation = animate(counter, {
              n: value,
              duration: MOTION.hero,
              ease: MOTION.ease,
              onUpdate: () => {
                el.textContent = String(Math.round(counter.n));
              },
              onComplete: settle,
            });
            dispose = () => animation.pause();
          })
          .catch(settle);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      dispose?.();
      settle();
    };
  }, [ref, value]);
}

/**
 * Calls onChange as the element enters/leaves the viewport — used to pause
 * idle animation loops while they are offscreen. Pass a stable callback
 * (useCallback) or the observer is recreated on every render.
 */
export function useInViewToggle(
  ref: RefObject<HTMLElement | null>,
  onChange: (inView: boolean) => void
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => onChange(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, onChange]);
}
