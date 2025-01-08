import Link from 'next/link';

import AcmeLogo from '@/app/ui/acme-logo';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';

export default async function TopNav() {
    const session = await auth();
  return (
    <div className="flex h-full flex-row px-2 py-0 md:px-2">
      
      <div className="flex grow flex-row justify-end space-x-2 md:space-x-0 md:py-2">
        
        <UserCircleIcon className="w-6" />
            <div className="my-0">{ session?.user?.name || 'Guest' }</div>
                  
        </div>
        
      
    </div>
  );
}
