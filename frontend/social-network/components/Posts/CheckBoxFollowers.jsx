"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { fetchApi } from "@/api/fetchApi";
import style from "../../styles/profile.module.css";

export function CheckBoxUsersFollowers({ onSelectedUsersChange }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const scrollContainerRef = useRef(null);
  const isFetching = useRef(false);

  const fetchMoreData = useCallback(async (currentPage) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await fetchApi(
        `profiles/followers?user_id=${window.userState.id}&page=${currentPage}&limit=10`
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
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

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
  }, []);

  useEffect(() => {
    if (onSelectedUsersChange) {
      onSelectedUsersChange(selectedUsers);
    }
  }, [selectedUsers, onSelectedUsersChange]);

  const handleCheckboxChange = (userId, isChecked) => {
    setSelectedUsers((prev) => {
      if (isChecked) {
        return [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
  };

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
        <User
          data={data}
          selectedUsers={selectedUsers}
          onCheckboxChange={handleCheckboxChange}
        />
      ) : (
        !loading && <div>No followers found</div>
      )}

      {loading && <div>Loading more followers...</div>}

      {!hasMore && data.length > 0 && <div>No more followers</div>}
    </div>
  );
}

function User({ data, selectedUsers, onCheckboxChange }) {
  return (
    <div>
      {data.length === 0 ? (
        <div>No followers found</div>
      ) : (
        data.map((item) => (
          <div
            key={`follower-row-${item.Id}`}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <input
              style={{ width: "5%" }}
              type="checkbox"
              id={`follower-${item.Id}`}
              checked={selectedUsers.includes(item.Id)}
              onChange={(e) => onCheckboxChange(item.Id, e.target.checked)}
            />

            <label htmlFor={`follower-${item.Id}`} style={{ width: "95%" }}>
              <div className={style["cont_user_list"]}>
                <img
                  src={
                    item.Avatar?.startsWith("http")
                      ? item.Avatar
                      : item.Avatar && item.Avatar !== "undefined"
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${item.Avatar}`
                      : "/images/test.jpg"
                  }
                  alt={item.Nickname}
                />
                <span>
                  {item.FirstName} {item.LastName}
                </span>
              </div>
            </label>
          </div>
        ))
      )}
    </div>
  );
}
