import axios from "@/config";
import type { SharedProps } from "@/types/shared";
import { router, usePage } from "@inertiajs/react";
import { useCallback } from "react";

/**
 * The two shapes every SFRA JSON endpoint can answer with besides its own
 * payload: a CSRF rejection, or a soft error carrying a message.
 */
export type SfraEnvelope = {
  error?: boolean | string;
  errorMessage?: string;
  csrfError?: boolean;
  redirectUrl?: string;
};

/** Thrown when an SFRA endpoint answers with an error envelope. */
export class SfraError extends Error {
  readonly csrf: boolean;

  constructor(message: string, csrf: boolean) {
    super(message);
    this.name = "SfraError";
    this.csrf = csrf;
  }
}

/**
 * Call an SFRA JSON endpoint.
 *
 * SFRA answers 200 for business failures and puts the failure in the body, so
 * the envelope is unwrapped here and turned into a rejection react-query can
 * see. A `csrfError` means the session's token pool moved on: reload the page
 * props (the token rides as an always() shared prop) so the next attempt
 * carries a fresh one.
 *
 * @param url a URL from `@/generated/routes` — never hand-built
 * @param body form fields; the CSRF pair is merged in by `useSfraRequest`
 */
async function request<T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response =
    body === undefined
      ? await axios.get<T & SfraEnvelope>(url)
      : await axios.post<T & SfraEnvelope>(url, new URLSearchParams(
          Object.entries(body).map(([k, v]) => [k, String(v)])
        ));

  const data = response.data;

  if (data?.csrfError) {
    router.reload();
    throw new SfraError("Your session expired. Please try again.", true);
  }

  if (data?.error) {
    // Base answers `{error, redirectUrl}` when the basket it was asked to
    // change is gone. Its jQuery assigned window.location; an Inertia visit
    // is the same move without the full page load.
    if (data.redirectUrl) router.visit(data.redirectUrl);

    throw new SfraError(
      data.errorMessage || (typeof data.error === "string" ? data.error : "Something went wrong."),
      false
    );
  }

  return data;
}

/**
 * The CSRF pair as query parameters.
 *
 * SFRA's `req.form` is built by getFormData, which skips any key that also
 * appears in the query string — so a GET route base guarded with
 * `csrfProtection.validateAjaxRequest` can only be given its token in the
 * URL. POSTs carry it in the body instead; `useSfraRequest` does that.
 */
export function useCsrfParams(): Record<string, string> {
  const { csrf } = usePage<SharedProps>().props;
  return csrf ? { [csrf.tokenName]: csrf.token } : {};
}

/**
 * Bind `request` to the current page's CSRF token. Use this inside a
 * `useMutation`/`useQuery` rather than calling `request` directly, so POSTs
 * always carry `{ [tokenName]: token }`.
 */
export function useSfraRequest() {
  const { csrf } = usePage<SharedProps>().props;

  return useCallback(
    <T,>(url: string, body?: Record<string, unknown>) =>
      request<T>(
        url,
        body === undefined
          ? undefined
          : csrf
            ? { ...body, [csrf.tokenName]: csrf.token }
            : body
      ),
    [csrf]
  );
}
