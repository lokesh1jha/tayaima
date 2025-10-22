import { Suspense } from "react";
import LandingPageClient from "./page-client";
import { LandingPageSkeleton } from "@/components/skeletons/LandingPageSkeleton";

// Enable ISR (Incremental Static Regeneration) for better performance
export const revalidate = 300; // Revalidate every 5 minutes

export default function HomePage() {
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      <LandingPageClient />
    </Suspense>
  );
}