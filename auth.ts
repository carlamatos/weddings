import NextAuth, { DefaultSession } from 'next-auth';
import { Account, Profile, User, Session } from 'next-auth';

import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authConfig } from 'auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { DBUser } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { createExtendedUser } from './app/lib/actions';
import {JWT} from 'next-auth/jwt'




async function getUser(email: string): Promise<DBUser | undefined> {
  try {
    const user = await sql<DBUser>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    //throw new Error('Failed to fetch user.');
    return undefined;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) {
            console.log('User not found');
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({token, user, account, profile } : { token: JWT; user?: User | null; account?: Account | null; profile?: Profile | null }) {
      // Add user info to the token when logging in
      
      if (account?.provider === 'google' && profile?.email 
        && profile?.sub
        && profile.given_name
        && profile?.family_name
        && profile.name && token?.id) {
        //console.log('Profile object:', profile);
       

        const localuser = await getUser(profile.email);
        if (!localuser) {
          const userdata: DBUser = { id: '0', name: profile.name, email: profile.email, password: '', given_name: profile.given_name,family_name:profile.family_name, provider: 'Google', provider_id: profile.sub, picture: profile.picture  };
          const result = await createExtendedUser(userdata);

          if (result && result.errors) {
            // There was an error, handle the error
            console.log('Error:', result.errors);
            console.log('Message:', result.message);
          } else if (result && result.message) {
            // No errors, just a success message
            console.log('Success:', result.message);
          }
        }
      }

      if (user && token) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }: {
      session: Session | DefaultSession;
      token: JWT;
    }) {
      // Pass token data to the session object
      if (token?.email && session?.user) {
        const localuser = await getUser(token.email);  
        if (localuser !== undefined){
          session.user.id = localuser.id;
        }
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }

      return session;
    },
  },
});
