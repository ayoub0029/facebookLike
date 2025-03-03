import { useEffect, useState, useRef, useCallback } from "react";

export default function useLazyLoadById(fetchFunction, initialId = 0) {
    const [data, setData] = useState([]);
    const [lastId, setLastId] = useState(initialId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const loadingRef = useRef(false);

    // Scroll tracking
    const lastScrollY = useRef(0);
    const scrollThreshold = useRef(100); // 100px threshold
    const scrolledEnough = useRef(false);

    const loadData = useCallback(async () => {
        if (loadingRef.current || !hasMore) {
            return;
        }

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            const result = await fetchFunction(lastId);

            if (result.status !== undefined) {
                console.error("API returned error:", result.status, result.error);
                setError(`Error: ${result.error}, Status: ${result.status}`);
                setHasMore(false);
                return;
            }

            if (result.items && result.items.length > 0) {
                setData(prevData => {
                    const newItems = result.items.filter(
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
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [lastId, fetchFunction, hasMore]);

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    // Effect to load data when lastId changes
    useEffect(() => {
        if (lastId !== initialId) {
            loadData();
        }
    }, [lastId, loadData, initialId]);

    // Track scroll with threshold
    useEffect(() => {
        const initialScrollPosition = window.scrollY;
        lastScrollY.current = initialScrollPosition;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDifference = currentScrollY - lastScrollY.current;

            // Check if scrolled down at least 100px from last position
            if (scrollDifference >= scrollThreshold.current) {
                scrolledEnough.current = true;
                lastScrollY.current = currentScrollY; // Reset the reference point
            } else if (scrollDifference < 0) {
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Intersection observer for scrolling
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

    return {
        data,
        setData,
        loaderRef,
        loading,
        error,
        hasMore
    };
}