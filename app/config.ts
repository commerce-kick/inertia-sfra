import axios from "axios";

axios.defaults.headers.common["X-Inertia"] = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

function findHeaderKey(headers: any, key: string): string | null {
  if (!headers) {
    return null;
  }

  if (typeof headers.get === "function") {
    return key;
  }

  if (headers[key] !== undefined) {
    return key;
  }

  var lower = key.toLowerCase();
  if (headers[lower] !== undefined) {
    return lower;
  }

  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i]).toLowerCase() === lower) {
      return keys[i];
    }
  }

  return null;
}

function getHeader(headers: any, key: string) {
  if (!headers) {
    return undefined;
  }

  if (typeof headers.get === "function") {
    return headers.get(key);
  }

  var foundKey = findHeaderKey(headers, key);
  return foundKey ? headers[foundKey] : undefined;
}

function setHeader(headers: any, key: string, value: any) {
  if (!headers) {
    return;
  }

  if (getHeader(headers, key) !== undefined) {
    return;
  }

  if (typeof headers.set === "function") {
    headers.set(key, value);
    return;
  }

  headers[key] = value;
}

function copyHeader(headers: any, from: string, to: string) {
  if (!headers) {
    return;
  }
  var value = getHeader(headers, from);
  if (value === undefined) {
    return;
  }
  setHeader(headers, to, value);
}

function syncRequestHeaders(headers: any) {
  if (!headers) {
    return;
  }

  copyHeader(headers, "X-Inertia", "X-SF-CC-Inertia");
  copyHeader(headers, "X-Inertia-Version", "X-SF-CC-Inertia-Version");
  copyHeader(headers, "X-Inertia-Partial-Component", "X-SF-CC-Inertia-Partial-Component");
  copyHeader(headers, "X-Inertia-Partial-Data", "X-SF-CC-Inertia-Partial-Data");
  copyHeader(headers, "X-Inertia-Partial-Except", "X-SF-CC-Inertia-Partial-Except");
  copyHeader(headers, "X-Inertia-Reset", "X-SF-CC-Inertia-Reset");
  copyHeader(headers, "X-Inertia-Error-Bag", "X-SF-CC-Inertia-Error-Bag");
  copyHeader(headers, "X-Inertia-Except-Once-Props", "X-SF-CC-Inertia-Except-Once-Props");
  copyHeader(
    headers,
    "X-Inertia-Infinite-Scroll-Merge-Intent",
    "X-SF-CC-Inertia-Infinite-Scroll-Merge-Intent"
  );
}

function syncResponseHeaders(headers: any) {
  if (!headers) {
    return headers;
  }

  copyHeader(headers, "x-sf-cc-inertia", "x-inertia");
  copyHeader(headers, "x-sf-cc-inertia-version", "x-inertia-version");
  copyHeader(headers, "x-sf-cc-inertia-location", "x-inertia-location");

  return headers;
}

axios.interceptors.request.use((config: any) => {
  config.headers = config.headers || {};
  syncRequestHeaders(config.headers);
  return config;
});

axios.interceptors.response.use((response: any) => {
  response.headers = syncResponseHeaders(response.headers || {});

  return response;
});

export default axios;
