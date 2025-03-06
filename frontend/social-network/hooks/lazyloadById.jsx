import { useEffect, useState, useRef, useCallback } from "react";

export default function useLazyLoadById(fetchFunction, initialId = 0, endpoint = "", parentId = "", initialLoad = true) {
    const [data, setData] = useState([]);
    const [lastId, setLastId] = useState(initialId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const loadingRef = useRef(false);

    const lastScrollY = useRef(0);
    const scrollThreshold = useRef(100);
    const scrolledEnough = useRef(false);

    const loadData = useCallback(async () => {
        if (loadingRef.current || !hasMore) {
            return;
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            const result = await fetchFunction(lastId, endpoint !== "" ? endpoint : parentId);

            if (!result) {
                setError("Failed to load data");
                setHasMore(false);
                return;
            }

            if (result.status !== undefined) {
                setError(`Error: ${result.error || 'Unknown error'}, Status: ${result.status}`);
                setHasMore(false);
                return;
            }

            const items = result.items || [];

            if (items.length > 0) {
                setData(prevData => {
                    const newItems = items.filter(
                        newItem => !prevData.some(existingItem => existingItem.id === newItem.id)
                    );

                    if (newItems.length === 0) {
                        setHasMore(false);
                        return prevData;
                    }

                    return [...prevData, ...newItems];
                });
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error in lazy loading by ID:', err);
            setError('Failed to load data. Please try again.');
            setHasMore(false);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [lastId, fetchFunction, parentId, hasMore]);

    useEffect(() => {
        const loadInitialData = async () => {
            if ((initialLoad && parentId) || endpoint !== "") {
                await loadData();
            } else if (initialId !== 0) {
                await loadData();
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (lastId !== initialId) {
            loadData();
        }
    }, [lastId, loadData, initialId]);

    useEffect(() => {
        const initialScrollPosition = window.scrollY;
        lastScrollY.current = initialScrollPosition;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDifference = currentScrollY - lastScrollY.current;

            if (scrollDifference >= scrollThreshold.current) {
                scrolledEnough.current = true;
                lastScrollY.current = currentScrollY;
            } else if (scrollDifference < 0) {
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!hasMore) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingRef.current && scrolledEnough.current && data.length > 0) {
                    const currentLastId = data[data.length - 1].id;

                    if (currentLastId !== lastId) {
                        setLastId(currentLastId);
                        scrolledEnough.current = false;
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.disconnect();
            }
        };
    }, [data, hasMore, lastId]);

    const reset = () => {
        setData([]);
        setLastId(initialId);
        setHasMore(true);
        setError(null);
    };

    return {
        data,
        setData,
        loaderRef,
        loading,
        error,
        hasMore,
        reset
    };
}