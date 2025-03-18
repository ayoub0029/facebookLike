"use client";

import { useState } from "react";
import { UsersFollowing } from "@/components/profile/users_follow";

export default function ChatPage() {
  const [hamberMenu, setHamberMenu] = useState(false);

  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed">
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>Private Chat</div>
        <UsersFollowing userID={window.userState.id} route={"/chat"} />      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
      </div>
    </>
  );
}
