import NextAuth, { DefaultSession } from 'next-auth';
import { Account, Profile, User, Session } from 'next-auth';

import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { DBUser } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { createOAuthUser, claimUnverifiedAccount } from './app/lib/users';
import { verifyTotpProof } from './app/lib/totp-proof';
import { isTotpPending } from './app/lib/totp-session';
import {JWT} from 'next-auth/jwt'
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_ACCOUNT_LOGIN_ATTEMPTS = 10;

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

// Precomputed bcrypt hash of a fixed, unguessable string. Compared against
// when no account exists, so a login attempt for a nonexistent email costs
// the same bcrypt.compare() time as one for a real email — otherwise the
// response-time difference lets an attacker enumerate registered addresses.
const DUMMY_PASSWORD_HASH = '$2b$10$riu05Pya1ylj.Ct6.p1sP.Z3G1qTBav1g3/In1RKoZsj3B5/hVZzy';

const nextAuth = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
          request.headers.get('x-real-ip') ??
          'unknown';

        const rateLimitKey = `login:${ip}`;
        if (await isRateLimited(rateLimitKey, MAX_LOGIN_ATTEMPTS)) {
          return null;
        }
        await recordAttempt(rateLimitKey, LOGIN_WINDOW_MS);

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // Per-account limit too, so guesses spread over many IPs still stop.
          const accountKey = `login-account:${email.toLowerCase()}`;
          if (await isRateLimited(accountKey, MAX_ACCOUNT_LOGIN_ATTEMPTS)) return null;
          await recordAttempt(accountKey, LOGIN_WINDOW_MS);

          const user = await getUser(email);
          // Always run bcrypt.compare, even when the user doesn't exist (or
          // has no password — Google/Apple/Facebook accounts), so the
          // response time doesn't reveal whether the email is registered.
          const hash = user?.password || DUMMY_PASSWORD_HASH;
          const passwordsMatch = await bcrypt.compare(password, hash);

          if (user && user.password && passwordsMatch) return user;
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
    async jwt({token, user, account, profile, trigger, session } : { token: JWT; user?: User | null; account?: Account | null; profile?: Profile | null; trigger?: 'signIn' | 'signUp' | 'update'; session?: { user?: { totpProof?: string } } }) {
      // Session updates can come from the browser (POST /api/auth/session),
      // so a 2FA state change is only accepted with a server-signed proof
      // from /api/auth/2fa/verify, /enable or /disable (app/lib/totp-proof.ts).
      if (trigger === 'update') {
        const proof = session?.user?.totpProof;
        if (verifyTotpProof(token.email, proof, 'verified')) {
          token.totpRequired = true;
          token.totpVerified = true;
          token.totpVerifiedAt = Date.now();
        } else if (verifyTotpProof(token.email, proof, 'disabled')) {
          token.totpRequired = false;
        }
      }

      const oauthProviders = ['google', 'apple', 'facebook'];
      if (account?.provider && oauthProviders.includes(account.provider) && profile?.email && profile?.sub && token?.id) {
        const providerName = account.provider.charAt(0).toUpperCase() + account.provider.slice(1);
        const given_name = (profile.given_name as string) ?? (profile.name as string)?.split(' ')[0] ?? '';
        const family_name = (profile.family_name as string) ?? (profile.name as string)?.split(' ').slice(1).join(' ') ?? '';

        const localuser = await getUser(profile.email);
        if (!localuser) {
          await createOAuthUser({ name: profile.name as string, email: profile.email, given_name, family_name, provider: providerName, provider_id: profile.sub, picture: (profile.picture as string) ?? '' });
        } else if (!localuser.email_verified_at) {
          await claimUnverifiedAccount(profile.email);
        }
      }

      if (user && token) {
        token.id = user.id;
        // Whether this sign-in still owes a 2FA code. Recorded in the token
        // so the proxy can hold the session at /verify-2fa without a DB call.
        const signInEmail = (profile?.email as string | undefined) ?? user.email ?? token.email;
        const account2fa = signInEmail ? await getUser(signInEmail) : undefined;
        token.totpRequired = !!account2fa?.totp_enabled_at;
        token.totpVerified = false;
        token.totpVerifiedAt = undefined;
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
        session.user.verifiedEmail = !!localuser?.email_verified_at;
        session.user.totpEnabled = !!localuser?.totp_enabled_at;
        // Tokens issued before totpRequired existed fall back to the account setting.
        const totpRequired = token.totpRequired ?? !!localuser?.totp_enabled_at;
        session.user.totpPending = isTotpPending({ ...token, totpRequired });
        session.user.totpVerified = !session.user.totpPending && totpRequired;
      }

      return session;
    },
  },
});

export const { handlers, signIn, signOut, unstable_update } = nextAuth;

// The session as seen by the 2FA screen and its API only: includes sessions
// that signed in with a password but haven't entered their 2FA code yet.
export const authIncludingPending2fa = () => nextAuth.auth();

// Everywhere else, a session that still owes its 2FA code counts as signed
// out — so a stolen password alone can't use any API route, server action
// or page. (The proxy also holds such sessions at /verify-2fa.)
export async function auth(): Promise<Session | null> {
  const session = await nextAuth.auth();
  return session?.user?.totpPending ? null : session;
}
