import { http } from "@inertiajs/react";
import axios from "axios";

// axios serves the app's PLAIN SFRA JSON endpoints (suggestions, mini-cart,
// wishlist, checkout forms) — it is NOT involved in Inertia visits. Inertia v3
// ships its own XhrHttpClient; its customization points are http.onRequest /
// onResponse / onError below. Never set X-Inertia on axios: that would make
// ordinary AJAX calls masquerade as Inertia visits.
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// SFCC delivers custom response headers only with the X-SF-CC- prefix
// (cartridge httpHeadersConf.json); copy them back to the names the Inertia
// client reads. Empty values are skipped: httpHeadersConf.json emits the
// declared headers with empty defaults on every response, and an empty
// x-inertia-location must not look like a real location header.
const RESPONSE_HEADER_BRIDGE: Array<[string, string]> = [
  ["x-sf-cc-inertia", "x-inertia"],
  ["x-sf-cc-inertia-version", "x-inertia-version"],
  ["x-sf-cc-inertia-location", "x-inertia-location"],
  ["x-sf-cc-inertia-redirect", "x-inertia-redirect"],
];

function bridgePrefixedHeaders(headers: Record<string, string> | undefined) {
  if (!headers) {
    return;
  }
  for (const [from, to] of RESPONSE_HEADER_BRIDGE) {
    const value = headers[from];
    if (value !== undefined && value !== "" && headers[to] === undefined) {
      headers[to] = value;
    }
  }
}

http.onResponse((response) => {
  bridgePrefixedHeaders(response.headers as Record<string, string>);
  return response;
});

http.onError((error: any) => {
  bridgePrefixedHeaders(error?.response?.headers);
});

export default axios;
