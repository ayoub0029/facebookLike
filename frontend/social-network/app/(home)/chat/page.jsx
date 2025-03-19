"use client";

import { useState } from "react";
import { TalkedUser } from "@/components/profile/users_follow";

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
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>Private Chat Users</div>
        <TalkedUser />
      </aside>
      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
      </div>
    </>
  );
}
