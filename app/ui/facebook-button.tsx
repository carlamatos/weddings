'use client';

import { FacebookSignIn, FacebookSignInTo } from '@/app/lib/actions';

// "Continue with Facebook" — signs in, or creates the account on first use.
// next / lang: as GoogleButton.
export default function FacebookButton({ lang = 'en', next }: { lang?: 'en' | 'fr' | 'es'; next?: string }) {
  return (
    <button type="button" onClick={() => (next ? FacebookSignInTo(next, lang) : FacebookSignIn(lang))} className="auth-social-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} aria-hidden="true">
        <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/>
        <path fill="#fff" d="m16.67 15.56.53-3.49h-3.32V9.81c0-.96.46-1.89 1.96-1.89h1.5V4.95s-1.37-.24-2.68-.24c-2.74 0-4.54 1.68-4.54 4.7v2.66H7.08v3.49h3.04V24a12.1 12.1 0 0 0 3.76 0v-8.44z"/>
      </svg>
      {lang === 'fr' ? 'Continuer avec Facebook' : lang === 'es' ? 'Continuar con Facebook' : 'Continue with Facebook'}
    </button>
  );
}
