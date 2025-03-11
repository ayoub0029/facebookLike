"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/api/fetchApi.jsx";
import { FetchPosts } from "@/components/Posts/FetchPosts";
import ProfileComponent from "@/components/profile/profile.jsx";
import ToastNotification from "@/components/profile/toast.jsx";
import { SkeletonLoaderPosts } from "@/components/skeletons/profile_skel";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState("success");
  const [message, setMessage] = useState(
    "Your message has been sent successfully!"
  );
  const [hamberMenu, setHamberMenu] = useState(false);
  const params = useParams();

  const [profile, setProfile] = useState({
    Id: 0,
    ProfileStatus: "",
    Avatar: "",
    Nickname: "",
    First_Name: "",
    Last_Name: "",
    AboutMe: "",
    Email: "",
    DOB: "",
    Created_at: "",
    Follower: 0,
    Follwoed: 0
  });

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

  if (profile.Id === 0)
    return (
      <>
        <aside className="feed">
          <SkeletonLoaderPosts />
        </aside>
        <div className="rightSidebar"></div>
      </>
    );

  profile["isOwner"] = true;

  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  const showToast = (type, msg) => {
    setVariant(type);
    setMessage(msg);
    setOpen(true);
  };

  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed">
        <ToastNotification
          open={open}
          onClose={setOpen}
          variant={variant}
          message={message}
          duration={3000}
        />
        <FetchPosts
          endpoint={`posts/profile?user_id=${profile.Id}&last_id=`}
          lastId={0}
        />
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <ProfileComponent
          profile={profile}
          setProfile={setProfile}
          showToast={showToast}
        />
      </div>
    </>
  );
}
