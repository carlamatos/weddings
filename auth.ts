import NextAuth, { DefaultSession } from 'next-auth';
import { Account, Profile, User, Session } from 'next-auth';

import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
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
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({token, user, account, profile } : { token: JWT; user?: User | null; account?: Account | null; profile?: Profile | null }) {
      // Add user info to the token when logging in
      
      const oauthProviders = ['google', 'apple', 'facebook'];
      if (account?.provider && oauthProviders.includes(account.provider) && profile?.email && profile?.sub && token?.id) {
        const providerName = account.provider.charAt(0).toUpperCase() + account.provider.slice(1);
        const given_name = (profile.given_name as string) ?? (profile.name as string)?.split(' ')[0] ?? '';
        const family_name = (profile.family_name as string) ?? (profile.name as string)?.split(' ').slice(1).join(' ') ?? '';

        const localuser = await getUser(profile.email);
        if (!localuser) {
          const userdata: DBUser = { id: '0', name: profile.name as string, email: profile.email, password: '', given_name, family_name, provider: providerName, provider_id: profile.sub, picture: profile.picture as string };
          const result = await createExtendedUser(userdata);

          if (result && result.errors) {
            console.log('Error:', result.errors);
            console.log('Message:', result.message);
          } else if (result && result.message) {
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
