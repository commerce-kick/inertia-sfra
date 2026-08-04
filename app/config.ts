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
// client reads. Two platform quirks make this conditional:
//  - httpHeadersConf.json emits every declared header on EVERY response with
//    its default value, so X-SF-CC-Inertia: "true" also rides on 409s and
//    HTML error pages. Promoting it there makes the client treat an empty
//    409 body (or a 500 page) as an Inertia page and crash in setPage().
//  - empty defaults must never look like a real location/redirect header.
// Policy: 409s get the recovery headers (location/redirect/version) but
// never x-inertia, so the client routes them through its non-Inertia 409
// handling; JSON success responses get the full bridge; HTML/error
// responses get nothing.
const RECOVERY_HEADERS: Array<[string, string]> = [
  ["x-sf-cc-inertia-version", "x-inertia-version"],
  ["x-sf-cc-inertia-location", "x-inertia-location"],
  ["x-sf-cc-inertia-redirect", "x-inertia-redirect"],
];

const FULL_BRIDGE: Array<[string, string]> = [
  ["x-sf-cc-inertia", "x-inertia"],
  ...RECOVERY_HEADERS,
];

function bridgeHeaders(
  headers: Record<string, string> | undefined,
  pairs: Array<[string, string]>
) {
  if (!headers) {
    return;
  }
  for (const [from, to] of pairs) {
    const value = headers[from];
    if (value !== undefined && value !== "" && headers[to] === undefined) {
      headers[to] = value;
    }
  }
}

function bridgeResponse(response: {
  status?: number;
  headers?: Record<string, string>;
}) {
  const headers = response.headers as Record<string, string> | undefined;
  if (!headers) {
    return;
  }
  if (response.status === 409) {
    bridgeHeaders(headers, RECOVERY_HEADERS);
    return;
  }
  const contentType = headers["content-type"] || "";
  if ((response.status ?? 0) < 400 && contentType.includes("json")) {
    bridgeHeaders(headers, FULL_BRIDGE);
  }
}

http.onResponse((response) => {
  bridgeResponse(response as { status?: number; headers?: Record<string, string> });
  return response;
});

http.onError((error: any) => {
  if (error?.response) {
    bridgeResponse(error.response);
  }
});

export default axios;
