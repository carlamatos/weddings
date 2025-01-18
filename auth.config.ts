import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { fetchUserPageByEmail } from './app/lib/data';
import {fetchUser} from './app/lib/data';
export const authConfig = {
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        
        
        //check if the user has a page or if it is the first time it logs in
        const email = auth?.user?.email;
        console.log ("USER EMAIL" + email);

        const loggedInUser = fetchUser(email);
        

        console.log ("USER id" + loggedInUser);
        const userPage = false; //fetchUserPageByEmail(user_id);
        if (!userPage){
          return Response.redirect(new URL('/dashboard/setup', nextUrl));
        }


        return Response.redirect(new URL('/dashboard', nextUrl));
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