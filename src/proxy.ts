import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/keep-alive (public cron endpoint; must not be redirected to /login)
     * - _next/static, _next/image, favicon.ico
     * - common image files (incl. the logo)
     */
    "/((?!api/keep-alive|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
