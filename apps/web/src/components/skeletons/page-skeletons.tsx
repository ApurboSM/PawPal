import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-3" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  );
}

export function CardGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-white p-4 shadow-sm">
          <Skeleton className="h-40 w-full rounded-xl mb-4" />
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-3/4 mb-2" />
          <Skeleton className="h-3 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-4 rounded-xl border bg-white p-4">
          <Skeleton className="h-40 w-full sm:w-1/4 rounded-xl" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarLayoutSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/4">
        <div className="rounded-2xl border bg-white p-4">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="w-full lg:w-3/4">
        <CardGridSkeleton cards={8} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="h-[420px] w-full rounded-3xl" />
        <div>
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-11/12 mb-2" />
          <Skeleton className="h-4 w-10/12 mb-6" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 py-6 sm:py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-12">
          <div className="w-full xl:col-span-5">
            <Skeleton className="mb-4 h-12 w-full rounded-xl border border-rose-100/80 bg-white" />
            <div className="rounded-2xl border border-rose-100/80 bg-white p-6 shadow-sm sm:shadow-md">
              <Skeleton className="mb-3 h-7 w-2/3" />
              <Skeleton className="mb-6 h-4 w-full" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <Skeleton className="mx-auto mt-6 h-4 w-40" />
            </div>
          </div>

          <div className="w-full xl:col-span-7">
            <div className="rounded-2xl bg-[#FF6B98] p-5 sm:rounded-3xl sm:p-8 lg:p-10">
              <div className="mb-5 flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full bg-white/30" />
                <Skeleton className="h-8 w-32 bg-white/30" />
              </div>
              <Skeleton className="mb-3 h-10 w-11/12 bg-white/30 sm:h-12" />
              <Skeleton className="mb-2 h-4 w-full bg-white/30" />
              <Skeleton className="mb-6 h-4 w-5/6 bg-white/30" />
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-8 w-3/4 bg-white/30" />
                <Skeleton className="h-8 w-2/3 bg-white/30" />
                <Skeleton className="h-8 w-4/5 bg-white/30" />
                <Skeleton className="h-8 w-3/5 bg-white/30" />
              </div>
              <Skeleton className="mt-8 h-24 w-full rounded-xl bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AppointmentSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FormSkeleton />
        </div>
        <div className="lg:col-span-2">
          <CardGridSkeleton cards={4} />
        </div>
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="rounded-2xl border bg-white p-4">
        <Skeleton className="h-10 w-full mb-4" />
        <ListRowsSkeleton rows={5} />
      </div>
    </div>
  );
}

export function EmergencySectionSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <Skeleton className="h-6 w-56 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
