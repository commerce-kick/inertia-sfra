import { Button } from "@/components/ui/button";
import Image from "@/components/ui/image";
import { HomeShow } from "@/generated/routes";
import Layout from "@/layouts/default";
import { router } from "@inertiajs/react";

const ErrorPage = ({ status }: { status: 403 | 404 | 500 | 503 }) => {
  const title = {
    503: "503: Service Unavailable",
    500: "500: Server Error",
    404: "404: Page Not Found",
    403: "403: Forbidden",
  }[status];

  const description = {
    503: "Sorry, we are doing some maintenance. Please check back soon.",
    500: "Whoops, something went wrong on our servers.",
    404: "Sorry, the page you are looking for could not be found.",
    403: "Sorry, you are forbidden from accessing this page.",
  }[status];

  return (
    <div className="h-screen flex gap-12 items-center justify-center">
      <Image src="https://cataas.com/cat/gif" />
      <div className="text-center">
        <h1 className="text-9xl font-bold text-foreground">{status}</h1>
        <p className="text-2xl font-light text-muted-foreground mt-4">
          {title[status] || "Oops! Page not found"}
        </p>
        <p className="text-muted-foreground mt-4 mb-8">
          {description[status] ||
            "The page you are looking for might have been removed or is temporarily unavailable."}
        </p>
        <Button
          onClick={() => {
            router.visit(HomeShow.url());
          }}
        >
          Go back to homepage
        </Button>
      </div>
    </div>
  );
};

//@ts-ignore
ErrorPage.layout = (page) => <Layout children={page} />;

export default ErrorPage;
