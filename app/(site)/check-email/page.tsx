import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import type { Metadata } from 'next';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return lang === 'fr' ? AUTH_METADATA.checkEmailFr : lang === 'es' ? AUTH_METADATA.checkEmailEs : AUTH_METADATA.checkEmail;
}

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
        ) : lang === 'es' ? (
          // Visitors from the Spanish pages (/register?lang=es).
          <div lang="es">
            <h1 className="auth-heading">Revisa tu correo</h1>
            <p className="auth-subheading">
              {email
                ? <>Te enviamos un enlace de verificación a <strong>{email}</strong>. Haz clic en él para confirmar tu cuenta.</>
                : 'Te enviamos un enlace de verificación a tu correo electrónico. Haz clic en él para confirmar tu cuenta.'}
            </p>
            <p className="auth-footer">
              ¿Ya lo verificaste? <Link href="/login">Inicia sesión</Link>
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
