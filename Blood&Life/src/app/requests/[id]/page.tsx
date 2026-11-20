import React, { Suspense } from "react";
import RequestDetailContent from "./detail-content";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
          <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RequestDetailContent params={params} />
    </Suspense>
  );
}
