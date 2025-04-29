import ProductTile from "@/components/commerce/product-tile";
import HoverBox from "@/components/magic/hover-box";
import { InteractiveGridPattern } from "@/components/magic/interactive-pattern";
import { TextAnimate } from "@/components/magic/text-animate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "@/components/ui/image";
import Layout from "@/layouts/default";
import { cn } from "@/lib/utils";
import type { TProductFactory } from "@/types/productFactory";
import { Link } from "@inertiajs/react";
import {
  Brain,
  ExternalLink,
  Figma,
  FileArchive,
  Github,
  Heart,
  HelpCircle,
  LayoutGrid,
  Lock,
  ShoppingCart,
  User,
} from "lucide-react";

const HomePage = ({
  recommendedProducts,
  staticUrl,
  viewAllLink,
  ...props
}: {
  recommendedProducts: TProductFactory[];
  staticUrl: string;
  viewAllLink: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto grid items-center gap-8 pb-8 pt-6 md:py-10 lg:grid-cols-2">
        <div className="flex w-full items-start justify-center absolute inset-0">
          <InteractiveGridPattern
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_top_center,white,transparent)]",
              "relative w-auto h-auto"
            )}
            width={50}
            height={50}
            squares={[20, 10]}
            squaresClassName="hover:fill-blue-500"
          />
        </div>
        <div className="flex flex-col items-start gap-4 relative z-10">
          <TextAnimate
            animation="fadeIn"
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            The React Starter Store for Retail
          </TextAnimate>
          <p className="text-lg text-muted-foreground">
            A modern, high-performance e-commerce starter kit built with Inertia
            and shadcn/ui
          </p>
          <Button size="lg" className="mt-4">
            Get started
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full capitalize aspect-video bg-secondary/5 border border-border rounded-lg shadow-sm justify-center items-center flex text-4xl backdrop-blur-sm pointer-events-none">
            The modern Monolith
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="container mx-auto py-8 md:py-12 relative z-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col items-center p-6 text-center hover:-translate-y-2.5 transition-all">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Download on GitHub</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get the source code and start building your store
            </p>
            <Button variant="outline" className="mt-auto">
              <Github className="mr-2 h-4 w-4" /> Clone Repository
            </Button>
          </Card>

          <Card className="flex flex-col items-center p-6 text-center hover:-translate-y-2.5 transition-all">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-medium">
              Deploy on Managed Runtime
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Deploy your store with one click to a managed platform
            </p>
            <Button variant="outline" className="mt-auto">
              <ExternalLink className="mr-2 h-4 w-4" /> Deploy Now
            </Button>
          </Card>

          <Card className="flex flex-col items-center p-6 text-center hover:-translate-y-2.5 transition-all">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <FileArchive className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Documentation</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Design your store with our documentation
            </p>
            <Button variant="outline" className="mt-auto" asChild>
              <a href="https://inertia-docs.vercel.app/docs">
                <FileArchive className="mr-2 h-4 w-4" /> Go to documentation
              </a>
            </Button>
          </Card>
        </div>
      </section>

      {/* Shop Products */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
            Shop Products
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            This section contains content from the catalog.{" "}
            <Link href="#" className="text-primary underline">
              Read docs
            </Link>{" "}
            on how to replace it.
          </p>

          <Carousel className="mx-auto max-w-5xl">
            <CarouselContent>
              {recommendedProducts.map((product, index) => (
                <CarouselItem key={`product-${index}`} className="md:basis-1/3">
                  <ProductTile  {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto py-12 md:py-16">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
          Features
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Out-of-the-box features so that you focus only on adding enhancements.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<ShoppingCart className="h-8 w-8" />}
            title="Cart & Checkout"
            description="Ecommerce best practice for a shopper's cart and checkout experience."
          />

          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Einstein Recommendations"
            description="Deliver the next best product or offer to every shopper through product recommendations."
          />

          <FeatureCard
            icon={<User className="h-8 w-8" />}
            title="My Account"
            description="Shoppers can manage account information such as their profile, addresses, payments and orders."
          />

          <FeatureCard
            icon={<Lock className="h-8 w-8" />}
            title="Shopper Login"
            description="Enable shoppers to easily log in with a more personalized shopping experience."
          />

          <FeatureCard
            icon={<LayoutGrid className="h-8 w-8" />}
            title="Components & Design Kit"
            description="Built using shadcn/ui, a simple, modular and accessible React component library."
          />

          <FeatureCard
            icon={<Heart className="h-8 w-8" />}
            title="Wishlist"
            description="Registered shoppers can add product items to their wishlist from purchasing later."
          />
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            We're here to help
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Contact our support staff. They will get you to the right place.
          </p>
          <Button>
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
};

function FeatureCard({ icon, title, description }: any) {
  return (
    <HoverBox>
      <Card className="flex flex-col p-6">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="mb-2 text-xl font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card>
    </HoverBox>
  );
}

//@ts-ignore
HomePage.layout = (page) => <Layout children={page} />;

export default HomePage;
