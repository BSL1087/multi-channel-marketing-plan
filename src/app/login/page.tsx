import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  // Defense in depth: if already logged in, skip the login page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <Image
            src="/agonsworld-logo-white-background.jpg"
            alt="agon's world"
            width={200}
            height={140}
            priority
            className="h-auto w-44 rounded-md"
          />
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
