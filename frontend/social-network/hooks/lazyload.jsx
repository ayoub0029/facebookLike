import { useEffect, useState, useRef, useCallback } from "react"

export default function useLazyLoad(fetchData) {
    console.log("im here in uselazy");

    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [nextPage, setNextPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const loaderRef = useRef(null)
    const loadingRef = useRef(false)
    const loadData = useCallback(async () => {
        if (loadingRef.current) return
        try {
            console.log("im here in usecallback");
            loadingRef.current = true
            setLoading(true)
            setError(null)
            const result = await fetchData(page)
            if (result.status !== undefined) {
                setError(`Error: ${result.error}, Status: ${result.status}`)
                return {
                    data,
                    loaderRef,
                    loading,
                    error,
                    nextPage,
                }
            }
            console.log(result.items);
            setData(prev => [...prev, ...result.items])
            console.log(result.nextPage);
            setNextPage(result.nextPage)
        } catch (err) {
            console.error('Error in lazy loading:', err)
            setError('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, [page])
    useEffect(() => {
        console.log("im here in loaddata");
        loadData()
    }, [page])
    useEffect(() => {
        if (nextPage === null || loading) return
        const observer = new IntersectionObserver(
            (entries) => {
                console.log("im here in observation");
                if (entries[0].isIntersecting && !loadingRef.current) {
                    console.log("now i see, current page:", page, "nextPage:", nextPage);
                    if (page !== nextPage) {
                        setPage(nextPage);
                    }
                }
            },
            { threshold: 0.1 }
        )
        console.log(loaderRef.current);
        
        if (loaderRef.current) observer.observe(loaderRef.current)
        return () => {
            if (loaderRef.current) observer.disconnect()
        }
    }, [nextPage, loading])
    return {
        data,
        loaderRef,
        loading,
        error,
        nextPage,
    }
}
