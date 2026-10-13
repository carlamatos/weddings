
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import type { Session } from "next-auth";
import type { NextRequest  } from "next/server";
import type { NextAuthConfig } from 'next-auth';
import { isAppPath, sharedCookieDomain } from './app/lib/app-url';
import { isTotpPending } from './app/lib/totp-session';
import { isSessionRevoked } from './app/lib/session-revocation';

// With the dashboard on app.mygala.ca and event pages on mygala.ca, the
// session cookie is set for the whole domain so both hosts see who is signed
// in (the "Edit page" / "Dashboard" buttons on public pages). It gets a new
// name so older host-only cookies from before the split are simply ignored —
// everyone signs in once. Off (Auth.js defaults) when the split is off.
const cookieDomain = sharedCookieDomain();
const sharedSessionCookie = cookieDomain
  ? {
      sessionToken: {
        name: '__Secure-mygala.session-token',
        options: { domain: cookieDomain, httpOnly: true, sameSite: 'lax' as const, path: '/', secure: true },
      },
    }
  : undefined;

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  ...(sharedSessionCookie ? { cookies: sharedSessionCookie } : {}),
  callbacks: {
    // The proxy's view of the session: only what authorized() needs, from
    // the token alone (no DB). auth.ts defines the full session callback.
    session({ session, token }) {
      if (session.user) {
        session.user.totpPending = isTotpPending(token);
        session.user.signedInAt = token.signedInAt;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Default callbackUrl is "/" — send to dashboard instead
      if (url === baseUrl || url === `${baseUrl}/`) return `${baseUrl}/dashboard`;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    async authorized({
      auth,
      request,
    }: {
      auth: Session | null; // Type for the auth object
      request: NextRequest; // Type for the incoming request
    }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // Signed in before the account's password last changed (on this or
      // another device): counts as signed out. Account screens go to the
      // login page; everything else renders signed out (auth() in auth.ts
      // agrees), so there's no redirect loop and no cookie juggling.
      if (isLoggedIn && (await isSessionRevoked(auth?.user?.email, auth?.user?.signedInAt))) {
        const p = nextUrl.pathname;
        if (p.startsWith('/dashboard') || p.startsWith('/admin') || p.startsWith('/verify-2fa')) {
          return Response.redirect(new URL('/login', nextUrl));
        }
        return true;
      }

      // Signed in with a password but the 2FA code is still owed: app
      // screens wait at /verify-2fa. Public pages render as signed out
      // (auth() in auth.ts hides pending sessions everywhere else).
      if (isLoggedIn && auth?.user?.totpPending) {
        if (nextUrl.pathname.startsWith('/verify-2fa')) return true;
        if (isAppPath(nextUrl.pathname)) return Response.redirect(new URL('/verify-2fa', nextUrl));
        return true;
      }
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnAdmin) {
        // Whether the user is actually an admin is checked in app/admin/layout.tsx.
        return isLoggedIn;
      } else if (nextUrl.pathname.startsWith('/verify-2fa')) {
        // A user mid-2FA-challenge must always reach this page.
        return true;
      } else if (isLoggedIn) {
        // Signed-in visitors browse the homepage, marketing pages and event
        // pages normally. Only the sign-in screens send them on to the
        // dashboard, which itself sends anyone without a page yet to
        // /dashboard/setup.
        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ]
} satisfies NextAuthConfig;

