import { greatVibes } from '@/app/ui/fonts';
import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import '@/app/ui/auth.css';

export default function LoginPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href="/" className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <LoginForm />
    </main>
  );
}
