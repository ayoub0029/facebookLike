"use client";

import { useState, useCallback } from "react";
import { CreatePost } from "@/components/Posts/CreatePost";
import { FetchPosts } from "@/components/Posts/FetchPosts";
import ProfileGrp from "./ProfileGrp";
import InvitUser from "./InvitUser";
export default function GroupById(id) {
    console.log(id.groupId);

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
                <CreatePost onSuccess={handleReload} onGroup={true} groupId={id.groupId} />
                <FetchPosts key={reloadKey} endpoint={`/posts/group?group_id=${id.groupId}&last_id=`} lastId={0} />
            </aside>
            {hamberMenu === true && <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
                <ProfileGrp />
                <InvitUser userID={window.userState.id} />
            </div>}
        </>
    );
}
