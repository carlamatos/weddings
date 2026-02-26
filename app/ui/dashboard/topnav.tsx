import { UserCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';

export default async function TopNav() {
    const session = await auth();
    const userId = session?.user?.id;
    const userPage = userId ? await fetchUserPageById(userId) : undefined;
  return (
    <div className="flex h-full flex-row px-2 py-0 md:px-2">
      <div className="flex grow flex-row justify-end items-center gap-6 md-py-2">
        {userPage && (
          <a
            href={`/${userPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 white-font text-sm"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            Preview Page
          </a>
        )}
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 white-font" />
          <div className="white-font">{ session?.user?.name || 'Guest' }</div>
        </div>
      </div>
    </div>
  );
}
