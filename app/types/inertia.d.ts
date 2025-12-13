import { TAccount } from "@/types/account";
import { NavigationData } from "@/types/navigation";
import { PageProps as InertiaPageProps } from "@inertiajs/core";

declare module "@inertiajs/core" {
  interface PageProps extends InertiaPageProps {
    currentCustomer: TAccount;
    navBar: NavigationData
  }
}
