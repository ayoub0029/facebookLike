// "use-cliant"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from "@/api/fetchApi"
import style from "./profile.module.css"
import config from "../../constns.json"
import Link from 'next/link';

export function UsersFollowers({ userID }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  const fetchMoreData = useCallback(async (currentPage) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await fetchApi(`profiles/followers?user_id=${userID}&page=${currentPage}&limit=10`, "GET");

      if (!response || !Array.isArray(response)) {
        setHasMore(false);
        return;
      }

      setData((prev) => [...prev, ...response]);

      if (response.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [userID]);

  useEffect(() => {
    fetchMoreData(page);
  }, [page, fetchMoreData]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 100 &&
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

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, [userID]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: "400px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {data.length > 0 ? (
        <User data={data} />
      ) : !loading && (
        <div>No followers found</div>
      )}

      {loading && (
        <div>Loading more followers...</div>
      )}

      {!hasMore && data.length > 0 && (
        <div>No more followers</div>
      )}
    </div>
  );
}


export function UsersFollowing({ userID }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  const fetchMoreData = useCallback(async (currentPage) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await fetchApi(`profiles/following?user_id=${userID}&page=${currentPage}&limit=10`, "GET");

      if (!response || !Array.isArray(response)) {
        setHasMore(false);
        return;
      }

      setData((prev) => [...prev, ...response]);

      if (response.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [userID]);

  useEffect(() => {
    fetchMoreData(page);
  }, [page, fetchMoreData]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 100 &&
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

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, [userID]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: "400px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {data.length > 0 ? (<User data={data} />) : !loading && (
        <div>No followers found</div>
      )}

      {loading && (
        <div>Loading more followers...</div>
      )}

      {!hasMore && data.length > 0 && (
        <div>No more followers</div>
      )}
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
          <Link href={`/profile/${item.Id}`} key={item.id || index}>
            <div className={style["cont_user_list"]} >
              <img
                src={item.Avatar ? item.Avatar : config.defaultImage}
                alt={item.Nickname}
                onError={(eve) => eve.target.srcset = config.defaultImage}
              />
              <span>{item.FirstName} {item.LastName}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
