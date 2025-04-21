
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-40 w-full mt-4" />
    </div>
  );
}
