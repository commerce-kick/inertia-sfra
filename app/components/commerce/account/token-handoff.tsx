import { Button } from "@/components/ui/button";
import { accountDoSetNewPassword } from "@/generated/routes/account-dosetnewpassword";
import { formPost } from "@/lib/form-post";
import { useEffect, useRef } from "react";

/**
 * Hand the reset token from the emailed link on to the form that uses it.
 *
 * This is base's newPasswordRedirect: a form carrying the token, posted the
 * moment the page arrives, so the URL the shopper ends up on is the form's
 * and not the one with a token in it. Base clicked its own button with a line
 * of script; here the post is an effect and the button is what a visitor
 * without it — or one who arrives back on this page — still has.
 *
 * The post fires once: a second one would land the shopper on the same form
 * twice over.
 */
export function TokenHandoff({ token }: { token: string }) {
  const sent = useRef(false);

  const handoff = () => {
    if (sent.current) return;
    sent.current = true;
    // A real form POST, as base's own newPasswordRedirect template was —
    // Account-DoSetNewPassword reads the token off `req.form`, which SFCC
    // fills only from an encoded body.
    formPost(accountDoSetNewPassword({}), { token });
  };

  useEffect(handoff, []);

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        One moment — taking you to the form where you set your new password.
      </p>
      <Button onClick={handoff} className="label-caps h-12 w-fit px-8">
        Continue
      </Button>
    </div>
  );
}
