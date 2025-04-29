"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { Category } from "@/types/navigation";
import { Link } from "@inertiajs/react";

// Sample featured items that could be displayed in a special section
const featuredItems = [
  {
    title: "New Collection",
    description: "Check out our latest seasonal arrivals with premium quality.",
    href: "/new-collection",
  },
  {
    title: "Sale Items",
    description: "Up to 50% off on selected items while supplies last.",
    href: "/sale",
  },
];

interface CommerceNavigationProps {
  categories: Category[];
}

export function CommerceNavigation({ categories }: CommerceNavigationProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {categories.map((category) => {
          // For categories without subcategories or with simple subcategories
          if (!category.complexSubCategories) {
            return (
              <NavigationMenuItem key={category.id}>
                {category.subCategories ? (
                  <>
                    <NavigationMenuTrigger>
                      {category.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {category.subCategories.map((subCategory) => (
                          <ListItem
                            key={subCategory.id}
                            title={subCategory.name}
                            href={subCategory.url}
                          />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    asChild
                  >
                    <Link href={category.url}>{category.name}</Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            );
          }

          // For complex categories like Womens and Mens with nested subcategories
          return (
            <NavigationMenuItem key={category.id}>
              <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[700px] lg:w-[800px] lg:grid-cols-3">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        href={category.url}
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {category.name} Collection
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Discover our latest {category.name.toLowerCase()}{" "}
                          styles and accessories.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                  {category.subCategories?.map((subCategory) => (
                    <div key={subCategory.id} className="space-y-2">
                      <h4 className="text-sm font-medium leading-none">
                        {subCategory.name}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {subCategory.subCategories?.map((nestedSubCategory) => (
                          <li key={nestedSubCategory.id}>
                            <Link
                              href={nestedSubCategory.url}
                              className="text-muted-foreground hover:text-primary hover:underline"
                            >
                              {nestedSubCategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
