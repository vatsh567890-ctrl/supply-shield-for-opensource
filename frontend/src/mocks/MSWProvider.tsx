"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initMocks() {
      if (
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_USE_MOCKS === "true"
      ) {
        try {
          const { worker } = await import("./browser");
          await worker.start({
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });
        } catch (err) {
          console.warn("[MSW] Mock worker failed to start, falling back to direct network:", err);
        } finally {
          setReady(true);
        }
      } else {
        setReady(true);
      }
    }

    initMocks();
  }, []);

  if (!ready && process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return null;
  }

  return <>{children}</>;
}
