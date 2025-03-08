"use client";

import { useState, useCallback } from "react";
import { CreatePost } from "@/components/Posts/CreatePost";
import { FetchPosts } from "@/components/Posts/FetchPosts";
import { HomeProfile } from "@/components/homeLoggedUser";
import { UsersFollowing } from "@/components/profile/users_follow";

export default function Home() {
  const [reloadKey, setReloadKey] = useState(0);
  const [hamberMenu, setHamberMenu] = useState(false);

  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed">
        <CreatePost onSuccess={handleReload} />
        <FetchPosts key={reloadKey} endpoint="posts?last_id=" lastId={0} />
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <HomeProfile />
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>My Following</div>
        <UsersFollowing userID={window.userState.id} />
      </div>
    </>
  );
}
