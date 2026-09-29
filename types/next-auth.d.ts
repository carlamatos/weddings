export {};

declare module 'next-auth' {
  // Session/JWT callbacks in auth.ts are typed with a `Session | DefaultSession`
  // union, so these need to live on User/DefaultUser (shared by both), not
  // just on Session — otherwise assignment only type-checks for one branch.
  interface User {
    verifiedEmail?: boolean;
    totpEnabled?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    totpVerified?: boolean;
    totpVerifiedAt?: number;
  }
}
