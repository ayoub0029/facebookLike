"use client";

import { useState, useCallback } from "react";
import { CreatePost } from "@/components/Posts/CreatePost";
import { FetchPosts } from "@/components/Posts/FetchPosts";

export default function Home() {
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return (
    <>
      <aside className="feed">
        <CreatePost onSuccess={handleReload} />
        <FetchPosts key={reloadKey} endpoint="posts?last_id=" lastId={0} />
      </aside>

      <div className="rightSidebar"></div>
    </>
  );
}
