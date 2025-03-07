import { useEffect, useState, useRef, useCallback } from "react";

export default function useLazyLoad(fetchData) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loaderRef = useRef(null);
  const loadingRef = useRef(false);
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const result = await fetchData(page);
      if (result.status !== undefined) {
        setError(`Error: ${result.error}, Status: ${result.status}`);
        return {
          data,
          loaderRef,
          loading,
          error,
          nextPage,
        };
      }
      console.log(result.items);
      setData((prev) => [...prev, ...result.items]);
      setNextPage(result.nextPage);
    } catch (err) {
      console.error("Error in lazy loading:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page]);
  useEffect(() => {
    loadData();
  }, [page]);
  useEffect(() => {
    if (nextPage === null || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          if (page !== nextPage) {
            setPage(nextPage);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.disconnect();
    };
  }, [nextPage, loading]);
  return {
    data,
    loaderRef,
    loading,
    error,
    nextPage,
  };
}
