"use client"
import { Notification } from "@/components/notification/Notification";
import { HomeProfile } from "@/components/homeLoggedUser";
import { UsersFollowing } from "@/components/profile/users_follow";

export default function Notifications() {

  return (
    <>
      <aside className="feed">
        <Notification />
      </aside>
      <div className={"rightSidebar show"}>
        <HomeProfile />
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          Private Chat 
        </div>
        <UsersFollowing userID={window.userState.id} route={"/chat"} />
      </div>
    </>
  )
}
