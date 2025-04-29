import axios from "axios";

// Set both SFCC and standard Inertia headers
axios.defaults.headers.common["X-Inertia"] = true;
axios.defaults.headers.common["X-SF-CC-Inertia"] = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.response.use(
  (response) => {
    const headers = response.headers || {};

    // Handle redirects
    if (headers["x-sf-cc-inertia-location"]) {
      const redirectUrl = headers["x-sf-cc-inertia-location"];
      if (headers["x-sf-cc-inertia-should-redirect"] === "true") {
        window.location.href = redirectUrl;
        return Promise.reject({ isRedirect: true });
      }
    }

    // Ensure both SFCC and standard Inertia headers are present
    response.headers = {
      ...headers,
      "x-inertia": true,
      "x-sf-cc-inertia": true,
    };

    // Copy SFCC headers to standard Inertia headers
    if (headers["x-sf-cc-inertia-version"]) {
      response.headers["x-inertia-version"] =
        headers["x-sf-cc-inertia-version"];
    }
    if (headers["x-sf-cc-inertia-location"]) {
      response.headers["x-inertia-location"] =
        headers["x-sf-cc-inertia-location"];
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 409) {
        window.location.reload();
        return Promise.reject({ isVersionMismatch: true });
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
