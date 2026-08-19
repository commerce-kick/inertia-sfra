/**
 * Submit a real form POST to an SFRA route.
 *
 * Inertia's `router.post` sends a JSON body. SFRA builds `req.form` from
 * `request.httpParameterMap` (modules/server/request.js), and SFCC only fills
 * that map from an encoded form body — a JSON payload never reaches it. So a
 * route that reads `req.form.<field>` sees nothing, takes its "missing
 * parameter" branch, and answers an ISML error page, which the Inertia client
 * then cannot parse. That is not a case to work around on the server: the two
 * routes this affects are POST-rendered *pages*, and base drove both of them
 * with a genuine form submission — Order-Confirm from its checkout script,
 * Account-DoSetNewPassword from a form its template auto-submitted.
 *
 * So this is base's own mechanism, not a fallback: a hidden form, posted the
 * way the browser has always posted forms. It costs a full page load, which
 * is why it is used *only* for these two once-per-flow navigations and never
 * for the JSON endpoints — those go through `useSfraRequest`, which posts
 * url-encoded and reaches `req.form` correctly.
 *
 * The load is not a downgrade in either place: both are terminal steps that
 * end one flow and open another, and the server renders an Inertia page in
 * response, so the app boots straight onto it exactly as it does on any first
 * visit. Keeping the values in the body is also the point — an order number
 * and its token do not belong in a URL, in history, or in a referrer.
 */
export function formPost(url: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.hidden = true;

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
