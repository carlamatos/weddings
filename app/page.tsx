import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      
      <div className="flex h-20 shrink-0 items-end rounded-lg p-4 md-h-52">
      <AcmeLogo />
        {/*  */}
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md-flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md-w-2-5 md-px-20">
        <div className="triangle-shape" />
          <p className={`${lusitana.className} text-xl text-gray-800 md-text-3xl md-leading-normal`}>
            <strong>Welcome to Acme.</strong> This is the example for the{' '}
            <a href="https://nextjs.org/learn/" className="text-blue-500">
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>
          <Link
            href="/login"
            className="home-cta-btn"
          >
            <span>Log in</span> <ArrowRightIcon className="nav-arrow-icon" />
          </Link>

          <Link
            href="/subscribe"
            className="home-cta-btn"
          >
            <span>Subscribe</span> <ArrowRightIcon className="nav-arrow-icon" />
          </Link>
        </div>
        <div className="flex items-center justify-center p-6 md-w-3-5 md-px-28 md-py-12">
        <Image
        src="/hero-desktop.png"
        width={1000}
        height={760}
        className="logo-img"
        alt="Screenshots of the dashboard project showing desktop version"
      />

<Image
        src="/hero-mobile.png"
        width={560}
        height={620}
        className="mobile-only"
        alt="Screenshots of the dashboard project showing mobile version"
        unoptimized
      />
        </div>
      </div>
    </main>
  );
}
