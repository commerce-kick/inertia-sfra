/**
 * Ask the Dynamic Imaging Service for an image at the size it will be drawn.
 *
 * Every catalog image URL SFCC hands out is a DIS URL: appending `sw`/`sh`
 * (scale width and height) and `sm` (scale mode) makes the platform render
 * and cache that variant, instead of shipping the full-size asset for the
 * browser to shrink. A 96px bag thumbnail served from a 1400px original is
 * the same picture and roughly two hundred times the bytes.
 *
 * The size that comes down from Business Manager is the *view type's* size,
 * so these URLs usually arrive with `sw`/`sh` already on them. They are
 * replaced rather than appended — a URL carrying two `sw` values is not a
 * request DIS can honour.
 *
 * `sm=fit` is deliberate: it scales the image to sit *within* the box,
 * preserving its aspect, so nothing is ever silently cropped by the server.
 * Where a component wants a fixed ratio it crops in CSS, visibly and in one
 * place. `sm=cut` would hand the crop to the platform, out of sight of the
 * design.
 *
 * Anything that is not a Demandware static URL — a demo asset, a Page
 * Designer upload on another host — is returned untouched.
 */
const DIS_HOST_MARKER = "/on/demandware.static/";

export type DisSize = {
  /** Rendered width in CSS pixels. */
  width: number;
  /** Rendered height in CSS pixels. */
  height: number;
  /** Device pixel ratio to request. */
  density?: number;
};

export function disUrl(url: string, { width, height, density = 1 }: DisSize) {
  if (!url || !url.includes(DIS_HOST_MARKER)) return url;

  try {
    // The base only matters for relative URLs; it never reaches the output.
    const parsed = new URL(url, "https://x.invalid");
    parsed.searchParams.set("sw", String(Math.round(width * density)));
    parsed.searchParams.set("sh", String(Math.round(height * density)));
    parsed.searchParams.set("sm", "fit");

    return url.startsWith("http")
      ? parsed.toString()
      : `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/**
 * The 1x/2x pair for the same box, so a retina screen gets the sharper
 * variant and an ordinary one never downloads it.
 */
export function disSrcSet(url: string, size: DisSize) {
  if (!url || !url.includes(DIS_HOST_MARKER)) return undefined;

  return [
    `${disUrl(url, { ...size, density: 1 })} 1x`,
    `${disUrl(url, { ...size, density: 2 })} 2x`,
  ].join(", ");
}
