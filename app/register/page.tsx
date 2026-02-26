import AcmeLogo from '@/app/ui/acme-logo';
import RegisterForm from '@/app/ui/register-form';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md-h-screen">
      <div className="relative mx-auto flex w-full max-w-400px flex-col space-y-2.5 p-4 md-mt-neg32">
        <div className="flex h-20 w-full items-end rounded-lg p-3 md-h-36 logo-container">
          
            <AcmeLogo />
          
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
