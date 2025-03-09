"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/api/fetchApi.jsx";
import { FetchPosts } from "@/components/Posts/FetchPosts";
import ProfileComponent from "@/components/profile/profile.jsx";

export default function Profile() {
  const [hamberMenu, setHamberMenu] = useState(false);
  const params = useParams();

  const [profile, setProfile] = useState(null);
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi("profiles", "GET");
      if (response.hasOwnProperty("error")) {
        alert(`Error: ${response.error} Status: ${response.status}`);
      } else {
        setProfile(response);
      }
    }

    fetchProfile();
  }, []);

  if (!profile) return <div> Loading... </div>;

  profile["isOwner"] = true;

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
        <FetchPosts
          endpoint={`posts/profile?user_id=${profile.Id}&last_id=`}
          lastId={0}
        />
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <ProfileComponent profile={profile} />
      </div>
    </>
  );
}
