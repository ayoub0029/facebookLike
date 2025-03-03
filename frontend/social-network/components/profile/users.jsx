import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/api/fetchApi.jsx"


export default function InfiniteScrollDiv({userID}) {
  console.log(userID);

  const [data, setData] = useState([]);  // Stores fetched data
  const [page, setPage] = useState(1);   // Current page
  const [loading, setLoading] = useState(false); // Prevent multiple calls
  const scrollContainerRef = useRef(null); // Reference to the scrollable div

  useEffect(() => {
    fetchMoreData();
    console.log("fetch data");

  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10 && !loading) {
        setPage((prev) => prev + 1);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading]);

  useEffect(() => {
    if (page > 1) {
      fetchMoreData();
    }
  }, [page]);
  async function fetchMoreData() {
    setLoading(true);
//profiles/followers?user_id=123&page=1
// profiles/following?user_id=${userID}&page=${page}
    const response = await fetchApi(`profiles/followers?user_id=3&page=1`, "GET")
    if (response?.hasOwnProperty("error")) {
      alert(`Error: ${response.error} Status: ${response.status}`);
    }else{
      setData((prev) => [...prev, ...response]);
    }

    setLoading(false);
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-64 w-full overflow-y-auto"
    >
      {data.map((item, index) => (
        <div key={index} className="p-2 border-b">{item.name}</div>
      ))}
      {loading && <div className="p-2 text-center">Loading more...</div>}
    </div>
  );
}
