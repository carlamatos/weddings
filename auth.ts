import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authConfig } from 'auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { createExtendedUser } from './app/lib/actions';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
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
    async jwt({ token, user, account, profile }) {
      // Add user info to the token when logging in

      if (account?.provider === 'google' && profile) {
        //console.log('Profile object:', profile);
        token.id = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.given_name = profile.given_name;
        token.family_name = profile.family_name;
        token.provider_id = profile.provider_id;
        token.picture = profile.picture;

        const localuser = await getUser(token.email);
        if (!localuser) {
          const userdata: User = { id: token.id, name: token.name, email: token.email, password: '', given_name: token.given_name,family_name:token.family_name, provider: 'Google', provider_id: token.sub, picture: token.picture  };
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

      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      // Pass token data to the session object
      const localuser = await getUser(token.email);
      if (token) {
        
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
