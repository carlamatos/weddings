
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import CardWrapper from '@/app/ui/dashboard/cards';
import { Suspense } from 'react';
import { CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';
import ImageUpload from '@/app/ui/image';
import EditableHeading from '@/app/ui/heading';
import EditableDescription from '@/app/ui/description';



export default async function Page() {
  
  return (
    <main className='p-6'>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
        
      
      <ImageUpload></ImageUpload>
      <div className='main_content'>
      <EditableHeading></EditableHeading>
      <EditableDescription defaultDescription="Love is friendship that has deepened and grown stronger. It is a gentle connection, built on trust and shared understanding. It thrives on compassion, support, and forgiveness. It stands by you through both the highs and the lows, accepting imperfections and embracing each other's flaws." />
      </div>
      </div>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
      <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
        
      </div>
    </main>
  );
  }
