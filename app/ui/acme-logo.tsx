import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image  from 'next/image';
export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-column items-center leading-none text-black`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
     <Image
             src="/images/logo.png"
             width={100}
             height={100}
             className="hidden md:block"
             alt="My Gala Logo"
           />
           <br/>
      <p className="text-[30px] p-4">MyGala</p>
    </div>
  );
}
