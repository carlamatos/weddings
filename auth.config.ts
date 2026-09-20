
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import { countUserPages, fetchUser } from './app/lib/data';
import type { Session } from "next-auth";
import type { NextRequest  } from "next/server";
import type { NextAuthConfig } from 'next-auth';
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
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

