
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import { countUserPages, fetchUser } from './app/lib/data';
import type { Session } from "next-auth";
import type { NextRequest  } from "next/server";
import type { NextAuthConfig } from 'next-auth';
import { sharedCookieDomain } from './app/lib/app-url';

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
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnAdmin) {
        // Must come before the branch below, which sends users without a
        // wedding page to /dashboard/setup — a super admin may not have one.
        // Whether the user is actually an admin is checked in app/admin/layout.tsx.
        return isLoggedIn;
      } else if (nextUrl.pathname.startsWith('/verify-2fa')) {
        // Must also come before the branch below — a user mid-2FA-challenge
        // needs to reach this page regardless of page count, and the
        // "no page yet" redirect would otherwise divert them straight into
        // /dashboard/setup without ever completing the challenge.
        return true;
      } else if (isLoggedIn) {


        //check if the user has a page or if it is the first time it logs in
        const email = auth?.user?.email;

        if (email){
        const loggedInUser = await fetchUser(email);

        if (loggedInUser !== undefined) {

          const pageCount = await countUserPages(loggedInUser.id);


          if (pageCount === 0) {
            return Response.redirect(new URL('/dashboard/setup', nextUrl));
          }
        }

        console.log('Current URL:', nextUrl.toString());

        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
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

