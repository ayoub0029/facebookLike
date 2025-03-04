"use client";
import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/api/fetchApi.jsx";

export function UsersFollowers({ userID}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  useEffect(() => {
    fetchMoreData(page);
  }, [page]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 50 &&
        !loading &&
        hasMore &&
        !isFetching.current
      ) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  async function fetchMoreData(currentPage) {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await fetchApi(`profiles/followers?user_id=${userID}&page=${currentPage}`, "GET");

      if (!response || !Array.isArray(response)) {
        console.error("Invalid API response:", response);
        setHasMore(false);
        return;
      }

      setData((prev) => [...prev, ...response]);

      if (response.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }

  return (
    <div ref={scrollContainerRef}>
      <User data={data} />
      {loading && <div>Loading more...</div>}
      {!hasMore && <div>No more followers</div>}
    </div>
  );
}

export function UsersFollowing({ userID}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  useEffect(() => {
    fetchMoreData(page);
  }, [page]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 50 &&
        !loading &&
        hasMore &&
        !isFetching.current
      ) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  async function fetchMoreData(currentPage) {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await fetchApi(`profiles/following?user_id=${userID}&page=${currentPage}`, "GET");

      if (!response || !Array.isArray(response)) {
        console.error("Invalid API response:", response);
        setHasMore(false);
        return;
      }

      setData((prev) => [...prev, ...response]);

      if (response.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }

  return (
    <div ref={scrollContainerRef}>
      <User data={data} />
      {loading && <div>Loading more...</div>}
      {!hasMore && <div>No more followers</div>}
    </div>
  );
}


function User({ data }) {
  return (
    <div>
      {data.length === 0 ? (
        <div>No followers found</div>
      ) : (
        data.map((item, index) => (
          <div key={item.id || index}>
            {item.FirstName} {item.LastName}
          </div>
        ))
      )}
    </div>
  );
}
