"use client"
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchApi } from "@/api/fetchApi";
import { debounce } from "@/utiles/Debounce";
import { fetchBylastId } from "../Posts/func_fetchposts";
import style from "../../styles/profile.module.css";
import Link from "next/link";
import { useToast } from "@/hooks/toast-context";

export function UsersFollowers({ userID, showToast }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  const fetchMoreData = useCallback(
    async (currentPage) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);

      try {
        const response = await fetchApi(
          `profiles/followers?user_id=${userID}&page=${currentPage}&limit=10`,
          "GET"
        );

        if (!response || !Array.isArray(response)) {
          setHasMore(false);
          return;
        }

        setData((prev) => [...prev, ...response]);

        if (response.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        showToast("error", error || "Unknown error");
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [userID]
  );

  useEffect(() => {
    fetchMoreData(page);
  }, [page, fetchMoreData]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 100 &&
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
        <User data={data} route={"/profile"} />
      ) : (
        !loading && <div>No followers found</div>
      )}

      {loading && <div>Loading more followers...</div>}

      {!hasMore && data.length > 0 && <div>No more followers</div>}
    </div>
  );
}

export function UsersFollowing({ userID, route, showToast }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  const fetchMoreData = useCallback(
    async (currentPage) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);

      try {
        const response = await fetchApi(
          `profiles/following?user_id=${userID}&page=${currentPage}&limit=10`,
          "GET"
        );

        if (!response || !Array.isArray(response)) {
          setHasMore(false);
          return;
        }

        setData((prev) => [...prev, ...response]);

        if (response.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        showToast("error", error || "Unknown error");
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [userID]
  );

  useEffect(() => {
    fetchMoreData(page);
  }, [page, fetchMoreData]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 100 &&
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
        <User data={data} route={route} />
      ) : (
        !loading && <div>No following found</div>
      )}

      {loading && <div>Loading more followings...</div>}

      {!hasMore && data.length > 0 && <div>No more followings</div>}
    </div>
  );
}

export function User({ data, route }) {
  return (
    <div>
      {data.length === 0 ? (
        <div>No followers found</div>
      ) : (
        data.map((item, index) => (
          <Link
            href={`${route}/${item.Id}`}
            key={item.id || index}
          >
            <div className={style["cont_user_list"]}>
              <img
                src={
                  item.Avatar?.startsWith("http")
                    ? item.Avatar
                    : item.Avatar && item.Avatar !== "undefined"
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${item.Avatar}`
                    : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
                }
                alt={item.Nickname}
              />
              <span>
                {item.fullname
                  ? item.fullname
                  : item.FirstName + " " + item.LastName}
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export function TalkedUser() {

  const [data, setData] = useState([]);
  const [lastId, setLastId] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const {showToast} = useToast()

  async function fetchUsers(lastid) {
     const newData = await fetchBylastId(lastid,"chats/userIchatWith?item_id=")
     setData(newData.items)
     setLastId(newData.items[newData.items.length - 1].id);
     if(newData.status !== undefined){
        showToast("error", newData.error)
        return
     }
   }

  useEffect(()=>{
    fetchUsers(0)
  },[])

  const HandleScroll = useCallback(
    debounce(async (e) => {
        const bottom = e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 1;
        if (bottom && lastId && !loading) {
          setLoading(true);
          const newData = fetchUsers(lastId)

          if (newData.items) {
              if (newData.items.length > 0) {
                  setData((prev) => [...prev, ...newData.items]);
                  setLastId(newData.items[newData.items.length - 1].id);
              }
              setLoading(false);
          }
        }
    }, 400),
    [lastId, loading]
);

useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", HandleScroll);

    return () => {
        container.removeEventListener("scroll", HandleScroll);
    };
}, [HandleScroll]);

  return (
    <div ref={containerRef} className="talked-user-container" style={{height:"300px",overflow:"auto"}}>
      {data && data.length > 0 ? (
        <User data={data} route="/chat" />
      ) : (
        <div>No user found</div>
      )}
    </div>
  );
}