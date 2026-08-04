import { Deferred, router, useForm, usePage, usePoll } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/components/link";
import { HomeContact, HomeClearHistory, SearchShow } from "@/generated/routes";

type FeedItem = { id: number; text: string };

type HomeProps = {
  errors: Record<string, string>;
  auth: { user: { firstName: string; email: string } | null };
  locale: string;
  serverNow: string;
  settings: { theme: string; flags?: { beta?: boolean } };
  quote?: string;
  notifications?: { id: number; text: string }[];
  tip?: string;
  flaky?: unknown;
  feed: FeedItem[];
  activity: FeedItem[];
  bootTime: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

export default function HomeShowPage(props: HomeProps) {
  const page = usePage();
  const flash =
    ((page as unknown as { flash?: Record<string, string> }).flash ?? {}) as Record<string, string>;

  // POLLING — a partial reload of just `serverNow` every 10s.
  usePoll(10000, { only: ["serverNow"] });

  const form = useForm({ name: "", email: "" });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Inertia × SFRA — feature showcase</h1>
        <p className="text-sm text-muted-foreground">
          component <code>{page.component}</code> · url <code>{page.url}</code> · version{" "}
          <code>{page.version}</code>
        </p>
      </header>

      {Object.entries(flash).map(([key, message]) => (
        <div
          key={key}
          className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <strong className="mr-2 uppercase">{key}</strong>
          {message}
        </div>
      ))}

      <div className="grid gap-6 md:grid-cols-2">
        <Section
          title="Shared props"
          description="Provided by the shareData middleware on every route; listed in the page's sharedProps key."
        >
          <p>
            locale: <Badge variant="outline">{props.locale}</Badge>
          </p>
          <p>
            auth.user:{" "}
            {props.auth.user ? (
              <span>
                {props.auth.user.firstName} ({props.auth.user.email})
              </span>
            ) : (
              <Badge variant="secondary">guest</Badge>
            )}
          </p>
        </Section>

        <Section
          title="Closure + dot-notation props + polling"
          description="serverNow is a closure resolved per render (re-fetched by usePoll every 10s). settings.flags.beta arrives via a dotted key merged into the nested object."
        >
          <p>
            serverNow: <code>{props.serverNow}</code>
          </p>
          <p>
            settings.theme: <code>{props.settings.theme}</code> · settings.flags.beta:{" "}
            <Badge>{String(props.settings.flags?.beta)}</Badge>
          </p>
        </Section>

        <Section
          title="Once prop"
          description="bootTime resolves once and the client remembers it for 60s (X-Inertia-Except-Once-Props). Navigate away and back within a minute — it doesn't change."
        >
          <p>
            bootTime: <code>{props.bootTime}</code>
          </p>
        </Section>

        <Section
          title="Optional prop (partial reload)"
          description="quote is omitted from the initial load and only resolves when explicitly requested with only: ['quote']."
        >
          <p className="min-h-6 italic">{props.quote ?? "— not loaded yet —"}</p>
          <Button size="sm" onClick={() => router.reload({ only: ["quote"] })}>
            Load quote
          </Button>
        </Section>

        <Section
          title="Deferred props (grouped)"
          description="notifications and tip share the defer group 'sidebar': excluded from first paint, then fetched together in one follow-up request."
        >
          <Deferred
            data={["notifications", "tip"]}
            fallback={<p className="animate-pulse">Loading sidebar group…</p>}
          >
            <ul className="list-disc pl-5">
              {props.notifications?.map((n) => (
                <li key={n.id}>{n.text}</li>
              ))}
            </ul>
            <p className="text-muted-foreground">{props.tip}</p>
          </Deferred>
        </Section>

        <Section
          title="Deferred + rescue"
          description="flaky's resolver always throws. With rescue: true the response survives and the path is reported in rescuedProps instead of a 500."
        >
          <Deferred
            data="flaky"
            fallback={<p className="animate-pulse">Loading flaky…</p>}
            rescue={
              <Badge variant="destructive">
                rescued — server reported rescuedProps: [&quot;flaky&quot;]
              </Badge>
            }
          >
            <code>{String(props.flaky)}</code>
          </Deferred>
          <p className="text-xs text-muted-foreground">
            The deferred XHR carries <code>rescuedProps: [&quot;flaky&quot;]</code> and the
            client renders this card&apos;s rescue slot.
          </p>
        </Section>

        <Section
          title="Merge + matchOn"
          description="feed is a merge prop upserting by id: each reload appends the new batch client-side. Reset drops the accumulated list."
        >
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {props.feed.map((item) => (
              <li key={item.id}>
                <code>{item.text}</code>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => router.reload({ only: ["feed"] })}>
              Load more ({props.feed.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.reload({ only: ["feed"], reset: ["feed"] })}
            >
              Reset
            </Button>
          </div>
        </Section>

        <Section
          title="Prepend"
          description="activity is a prepend merge prop — new entries appear at the TOP of the accumulated list."
        >
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {props.activity.map((item) => (
              <li key={item.id}>
                <code>{item.text}</code>
              </li>
            ))}
          </ul>
          <Button size="sm" onClick={() => router.reload({ only: ["activity"] })}>
            Log a visit
          </Button>
        </Section>

        <Section
          title="Form → validation errors + flash"
          description="Posts JSON to Home-Contact. Invalid input flashes an error bag (shared errors always-prop); valid input flashes a success message. Both arrive via redirect."
        >
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              form.post(HomeContact.url());
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
              />
              {form.errors.name && (
                <p className="text-xs text-red-600">{form.errors.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
              />
              {form.errors.email && (
                <p className="text-xs text-red-600">{form.errors.email}</p>
              )}
            </div>
            <Button size="sm" type="submit" disabled={form.processing}>
              Send
            </Button>
          </form>
        </Section>

        <Section
          title="History"
          description="Sets the session-backed clearHistory flag server-side; the next rendered page carries clearHistory: true and the client wipes its history state."
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.post(HomeClearHistory.url())}
          >
            Clear history state
          </Button>
        </Section>
      </div>

      <Separator />

      <p className="text-sm text-muted-foreground">
        Infinite scroll (scroll props + merge intent) lives on the{" "}
        <Link href={SearchShow.url({ params: { cgid: "root" } })} className="underline">
          search page
        </Link>
        .
      </p>
    </div>
  );
}
