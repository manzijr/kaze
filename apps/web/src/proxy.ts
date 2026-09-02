import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Resolve the locale (prefix/redirect/rewrite as needed) first; this
  // becomes the response we return, with the Supabase session-refresh
  // cookies layered on top of it below.
  const response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touching getUser() refreshes the session cookie if it's expired.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // /auth/callback is a Supabase redirect-URL target (allowlisted in the
  // Supabase dashboard) and isn't locale-prefixed -- keep it out of
  // next-intl's routing entirely.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
