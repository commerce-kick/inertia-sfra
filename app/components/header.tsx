"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { use$ } from "@legendapp/state/react";
import {
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  X,
  User,
  Menu,
  ChevronDown,
  LogOut,
  Home,
  Gift,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { cart$ } from "@/state/cart";
import type { MiniCartResponse } from "@/types/minicart";
import type { SearchSuggestionsResponse } from "@/types/search-suggestion";
import type { NavigationData } from "@/types/navigation";
import { CommerceNavigation } from "./commerce/nav";
import {
  Cart_MiniCartShow,
  Checkout_Begin,
  getUrl,
  Home_Show,
} from "@/generated/routes";

const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<{
    suggestions: SearchSuggestionsResponse;
  }>({
    queryKey: ["searchSuggestions", searchQuery],
    queryFn: async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get("SearchServices-GetSuggestions", {
          params: { q: searchQuery },
        });
        return data;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: searchQuery.length >= 3,
  });

  // Determine if we should show the popover based on having results
  const showResults =
    !isLoading &&
    searchQuery.length >= 3 &&
    data?.suggestions?.product?.products &&
    data.suggestions.product.products.length > 0;

  const handleItemClick = (url: string) => {
    router.visit(url);
  };

  return (
    <div className="relative flex-1 max-w-md hidden md:block">
      <form className="relative">
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Search products..."
          className="w-full pl-10 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      {/* Only show popover when we have results */}
      {showResults && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-md mt-1 py-2">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Products
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {data?.suggestions.product?.products?.map((product) => (
              <button
                key={product.url}
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center"
                onClick={() => handleItemClick(product.url)}
              >
                <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {product.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show loading indicator */}
      {isLoading && searchQuery.length >= 3 && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-md mt-1 p-4 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      )}
    </div>
  );
};

const MobileSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<{
    suggestions: SearchSuggestionsResponse;
  }>({
    queryKey: ["searchSuggestions", searchQuery],
    queryFn: async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get("SearchServices-GetSuggestions", {
          params: { q: searchQuery },
        });
        return data;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: searchQuery.length >= 3,
  });

  // Determine if we should show the popover based on having results
  const showResults =
    !isLoading &&
    searchQuery.length >= 3 &&
    data?.suggestions?.product?.products &&
    data.suggestions.product.products.length > 0;

  const handleItemClick = (url: string) => {
    router.visit(url);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden gap-2">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-4 gap-0">
        <SheetHeader className="px-0">
          <form className="relative">
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search products..."
              className="w-full pl-10 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </SheetHeader>

        {/* Only show popover when we have results */}
        {showResults && (
          <div className="w-full bg-background">
            <div className="py-1.5 text-xs font-medium text-muted-foreground">
              Products
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {data?.suggestions.product?.products?.map((product) => (
                <button
                  key={product.url}
                  className="w-full py-2 text-sm text-left hover:bg-muted flex items-center"
                  onClick={() => handleItemClick(product.url)}
                >
                  <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {product.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const DropDownUser = ({ firstName, lastName }: any) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu>
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline capitalize">{firstName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none capitalize">
              {firstName} {lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {/* Add user email here if available */}
              My Account
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="Account-Show"
            className="flex items-center cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="Loyalty-Show"
            className="flex items-center cursor-pointer"
          >
            <Gift className="mr-2 h-4 w-4" />
            <span>Loyalty</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="Login-Logout"
            className="flex items-center cursor-pointer text-red-500 hover:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CartContent = () => {
  const { data } = useQuery<MiniCartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axios.get(getUrl(Cart_MiniCartShow));
      return data;
    },
  });

  if (!data) return <div className="py-8 text-center">Loading cart...</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      {data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart yet. Start
            shopping to fill it up!
          </p>
          <SheetClose asChild>
            <Button className="mt-6" variant="outline" asChild>
              <Link href={getUrl(Home_Show)}>Continue Shopping</Link>
            </Button>
          </SheetClose>
        </div>
      ) : (
        <div className="px-6">
          <div className="space-y-6 py-6">
            {data?.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden border bg-muted/40">
                  <img
                    src={item.images.small[0].absURL || "/placeholder.svg"}
                    alt={item.images.small[0].alt}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {item.productName}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -mr-2 text-muted-foreground"
                      onClick={() => console.log(item.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.price.sales.formatted}
                  </p>
                  <div className="flex items-center mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => console.log(item.id)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => console.log(item.id)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4 py-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{data?.totals.subTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {data?.totals.totalShippingCost}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-lg">Total</span>
              <span className="font-bold text-lg">
                {data?.totals.grandTotal}
              </span>
            </div>
          </div>

          <div className="space-y-3 pb-6">
            <Button className="w-full" size="lg" asChild>
              <Link href={getUrl(Checkout_Begin)}>Proceed to Checkout</Link>
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link href={getUrl(Home_Show)}>Continue Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniCart = () => {
  const total = use$(cart$.quantity);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {total > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground"
              variant="default"
            >
              {total}
            </Badge>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Your Cart ({total} {total === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>
        <CartContent />
      </SheetContent>
    </Sheet>
  );
};

const MobileNav = ({ categories }: NavigationData) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="px-6 py-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="Home-Show"
              className="flex items-center py-2 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.url}
                className="flex items-center py-2 text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export function Header() {
  const { currentCustomer, navBar } = usePage<{
    currentCustomer: { profile: any };
    navBar: NavigationData;
  }>().props;

  return (
    <header className="w-full sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <MobileNav categories={navBar.categories} />

            <Link
              href="/on/demandware.store/Sites-RefArch-Site/en_US/Home-Show"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
              <span>Acme</span>
            </Link>

            <CommerceNavigation categories={navBar.categories} />
          </div>

          {/* Search Box */}
          <SearchBox />

          <div className="flex items-center gap-1 sm:gap-2">
            <MobileSearch />
            <ModeToggle />
            <MiniCart />

            {currentCustomer.profile ? (
              <DropDownUser {...currentCustomer.profile} />
            ) : (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/on/demandware.store/Sites-RefArch-Site/en_US/Login-Show">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
