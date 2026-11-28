// The key MyGala signs its private links with (page tokens, invitation and
// unsubscribe links, Secret Santa and DJ links, 2FA proofs): AUTH_SECRET.
// Without it, a signature made with an empty key could be forged by anyone,
// so signing and checking stop with an error instead (fail closed). Read
// when used, not at import, so a build without the variable still works.
export function signingKey(secret: string): string {
  if (!secret) throw new Error('AUTH_SECRET is not set: refusing to sign or check private links.');
  return secret;
}
