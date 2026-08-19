import { Button } from "@/components/ui/button";
import type { OAuthProvider } from "@/types/login";

/**
 * Sign in through an external identity provider.
 *
 * Base drew each provider with its brand glyph and colour; this world is
 * achromatic and the only chroma it permits means "destructive", so the
 * providers are named in words on outline buttons. They are ordinary links,
 * not form posts — base's `<form>` around them submitted nothing.
 *
 * Each destination needs the provider configured in Business Manager; with
 * none configured base's route answers its own error page, and so does this.
 */
export function OAuthLinks({ providers }: { providers: OAuthProvider[] }) {
  if (providers.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-t pt-8">
      <span className="label-caps text-muted-foreground">Or continue with</span>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            asChild
            variant="outline"
            className="label-caps h-12"
          >
            <a href={provider.url}>{provider.label}</a>
          </Button>
        ))}
      </div>
    </div>
  );
}
