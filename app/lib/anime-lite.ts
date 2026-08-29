/**
 * Re-exports only the anime.js pieces the storefront uses, so the lazy
 * chunk tree-shakes to a fraction of the full library. Never import this
 * statically from page code — go through loadAnime() in motion.ts.
 */
export { animate, createTimeline, stagger } from "animejs";
