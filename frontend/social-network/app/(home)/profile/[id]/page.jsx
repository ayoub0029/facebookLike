"use client";
import { fetchApi } from "@/api/fetchApi.jsx";
import { FetchPosts } from "@/components/Posts/FetchPosts";
import { useEffect, useState } from "react";
import ProfileComponent from "@/components/profile/profile.jsx";
import { useParams, redirect } from "next/navigation";
import NotFound404 from "@/components/404";
import { useToast } from "@/hooks/toast-context";

export default function Profile() {
  const [hamberMenu, setHamberMenu] = useState(false);
  const params = useParams();
  const { showToast } = useToast()
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
      const response = await fetchApi(`profiles?user_id=${params.id}`, "GET");
      if (response.hasOwnProperty("error")) {
        setProfile(404);
      } else {
        setProfile(response);
      }
    }

    fetchProfile();
  }, [params.id]);

  const [isFollow, setIsfollow] = useState(false);
  useEffect(() => {
    if (profile && profile !== 404) {
      async function fetchIsFollow() {
        const response = await fetchApi(
          `profiles/follow/status?user_id=${params.id}`,
          "GET"
        );
        if (response.hasOwnProperty("error")) {
          if (response.error.Error) {
            setIsfollow(404);
            return;
          } else if (
            response.error.Error === "you cant follow or unfollow youself"
          ) {
            redirect("/profile");
          }
          showToast("error", response.error.Error || "Unknown error")
        } else {
          setIsfollow(response);
        }
      }

      fetchIsFollow();
    }
  }, [profile, params.id]);

  if (profile.Id === 0) return <div> Loading... </div>;
  else if (profile === 404 || isFollow === 404) return <NotFound404 />;

  profile["Status"] = isFollow.Status;

  const toggleMenu = () => {
    setHamberMenu(!hamberMenu);
  };

  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed">
        {profile.ProfileStatus === "private" ? (
          <div>private account</div>
        ) : (
          <FetchPosts
            endpoint={`posts/profile?user_id=${profile.Id}&last_id=`}
            lastId={0}
          />
        )}
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <ProfileComponent profile={profile} setProfile={setProfile} />
      </div>
    </>
  );
}