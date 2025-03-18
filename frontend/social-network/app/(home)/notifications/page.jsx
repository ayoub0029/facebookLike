"use client"
import { Notification } from "@/components/notification/Notification";
import { HomeProfile } from "@/components/homeLoggedUser";
import { UsersFollowing } from "@/components/profile/users_follow";
import { useState } from "react";

export default function Notifications() {
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
        <Notification />
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <HomeProfile />
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          Private Chat
        </div>
        <UsersFollowing userID={window.userState.id} route={"/chat"} />
      </div>
    </>
  )
}