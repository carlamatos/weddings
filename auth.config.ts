import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { fetchUserPageById } from './app/lib/data';
import { fetchUser } from './app/lib/data';
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {


        //check if the user has a page or if it is the first time it logs in
        const email = auth?.user?.email;


        const loggedInUser = await fetchUser(email);

        if (loggedInUser !== undefined) {

          const userPage = await fetchUserPageById(loggedInUser.id);


          if (userPage === undefined) {
            return Response.redirect(new URL('/dashboard/setup', nextUrl));
          }
        }

        console.log('Current URL:', nextUrl.toString());

        if (nextUrl.pathname.startsWith('/login')) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),],
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;

