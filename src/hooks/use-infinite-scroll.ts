import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}

/**
 * Hook to handle infinite scroll using Intersection Observer
 * @param options - Configuration for infinite scroll
 * @returns Ref to attach to the sentinel element
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold,
        rootMargin: "100px", // Start loading 100px before reaching the sentinel
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

  return sentinelRef;
}

