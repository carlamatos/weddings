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
    // callback, and set via unstable_update({ user: { totpVerified: true } })
    // after a successful /verify-2fa challenge (this shape, nested under
    // `user`, is what unstable_update's type actually supports well).
    totpEnabled?: boolean;
    totpVerified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    totpVerified?: boolean;
    totpVerifiedAt?: number;
  }
}
