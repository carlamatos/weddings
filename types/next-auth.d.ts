export {};

declare module 'next-auth' {
  // Session/JWT callbacks in auth.ts are typed with a `Session | DefaultSession`
  // union, so these need to live on User/DefaultUser (shared by both), not
  // just on Session — otherwise assignment only type-checks for one branch.
  interface User {
    verifiedEmail?: boolean;
    // totpEnabled: persistent per-account flag, refreshed from the DB on
    // every request (session callback). totpVerified: per-session flag —
    // populated from the JWT (see next-auth/jwt below) in the session
    // callback. /verify-2fa sets it via unstable_update({ user: { totpProof } })
    // with a server-signed proof (app/lib/totp-proof.ts); the flag alone is
    // never trusted, because browsers can send session updates too.
    totpEnabled?: boolean;
    totpVerified?: boolean;
    totpProof?: string;
    // Set (on the proxy's session only) while 2FA is still owed.
    totpPending?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    totpRequired?: boolean; // account had 2FA on when this session signed in
    totpVerified?: boolean;
    totpVerifiedAt?: number;
  }
}
