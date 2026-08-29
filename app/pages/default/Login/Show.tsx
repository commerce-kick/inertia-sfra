import { LoginForm } from "@/components/commerce/account/login-form";
import { OAuthLinks } from "@/components/commerce/account/oauth-links";
import { RegisterForm } from "@/components/commerce/account/register-form";
import { Section } from "@/components/commerce/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LoginShowProps } from "@/types/login";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Show() {
  const { tab, rurl, login, register, oauth } = usePage<LoginShowProps>().props;
  const [pane, setPane] = useState<string>(tab);

  return (
    <>
      <Head title="Account — Meridian" />

      <Section title="Account" titleAs="h1" className="pb-24">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <Tabs value={pane} onValueChange={setPane}>
            <TabsList variant="line" className="w-full justify-start border-b">
              <TabsTrigger value="login" className="label-caps flex-none px-4">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="register" className="label-caps flex-none px-4">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="flex flex-col gap-8 pt-8">
              <LoginForm
                email={login.email}
                rememberMe={login.rememberMe}
                rurl={rurl}
              />
              <OAuthLinks providers={oauth} />
            </TabsContent>

            <TabsContent value="register" className="pt-8">
              <RegisterForm form={register} rurl={rurl} />
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </>
  );
}
