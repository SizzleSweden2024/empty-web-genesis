import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  className?: string;
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  children,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className = ''
}) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={className}>
      {children}
      
      {/* Loading indicator and intersection observer target */}
      <div ref={observerRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading more polls...</span>
          </div>
        ) : hasNextPage ? (
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            Scroll down to load more
          </div>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            No more polls to load
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScrollContainer;