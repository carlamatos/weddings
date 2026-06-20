import { greatVibes } from '@/app/ui/fonts';
import RegisterForm from '@/app/ui/register-form';
import Link from 'next/link';
import '@/app/ui/auth.css';

export default function RegisterPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href="/" className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <RegisterForm />
    </main>
  );
}
