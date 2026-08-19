import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loginLogout } from "@/generated/routes/login-logout";
import { loginShow } from "@/generated/routes/login-show";
import type { SharedProps } from "@/types/shared";
import { usePage } from "@inertiajs/react";
import { UserRound } from "lucide-react";

/**
 * The header's account glyph — base's Account-Header remote include, which
 * rendered the same two states out of an ISML fragment. The `auth.user`
 * shared prop carries the same fact, so no round trip is needed for it.
 *
 * Signed out, the glyph is simply the way to the sign-in page. Signed in, it
 * opens a menu naming who is signed in and offering the way out.
 *
 * Sign out is a GET, as base wrote it — and therefore must never be
 * prefetched: `Link` prefetches on hover in this storefront, and a hover that
 * ends the session is not a link, it is a trap.
 */
export function AccountMenu() {
  const { auth } = usePage<SharedProps>().props;

  if (!auth.user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href={loginShow({})} aria-label="Sign in">
          <UserRound className="size-4" />
        </Link>
      </Button>
    );
  }

  const name = `${auth.user.firstName} ${auth.user.lastName}`.trim();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${auth.user.firstName}’s account`}
        >
          <UserRound className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="label-caps">
          {name || auth.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={loginLogout({})} prefetch={false} className="label-caps">
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
