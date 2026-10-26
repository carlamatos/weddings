import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; lang?: string }>;
}) {
  const { email, lang } = await searchParams;
  const fr = lang === 'fr';

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card">
        {fr ? (
          // Visitors from the French landing page (/register?lang=fr).
          <div lang="fr">
            <h1 className="auth-heading">Vérifiez vos courriels</h1>
            <p className="auth-subheading">
              {email
                ? <>Nous avons envoyé un lien de vérification à <strong>{email}</strong>. Cliquez dessus pour confirmer votre compte.</>
                : 'Nous avons envoyé un lien de vérification à votre adresse courriel. Cliquez dessus pour confirmer votre compte.'}
            </p>
            <p className="auth-footer">
              Déjà vérifié? <Link href="/login">Se connecter</Link>
            </p>
          </div>
        ) : (
          <>
            <h1 className="auth-heading">Check your email</h1>
            <p className="auth-subheading">
              {email
                ? <>We&apos;ve sent a verification link to <strong>{email}</strong>. Click it to confirm your account.</>
                : "We've sent a verification link to your email address. Click it to confirm your account."}
            </p>
            <p className="auth-footer">
              Already verified? <Link href="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
