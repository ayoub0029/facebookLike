"use client"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import { useEffect, useState, useCallback } from "react"
import ProfileComponent from "@/components/profile/profile.jsx"
import { useParams, redirect } from "next/navigation"


export default function Profile() {
  const params = useParams();

  const [profile, setProfile] = useState(
    {
      AboutMe: "",
      Avatar: "",
      DOB: "",
      Email: "",
      First_Name: "rrr",
      Last_Name: "rrrrr",
      Follower: 0,
      Follwoed: 0,
      Nickname: "",
      ProfileStatus: "",
    })

  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi(`profiles?user_id=${params.id}`, "GET");
      if (response.hasOwnProperty("error")) {
        if (response.error.Error === "user does not exist") {
          setProfile(404)
          return
        }
        alert(`Error get profile: ${response.error.Error || 'Unknown error'} Status: ${response.status}`);

      } else {
        setProfile(response);
      }
    }

    fetchProfile();
  }, [params.id]);

  const [isFollow, setIsfollow] = useState(false);
  useEffect(() => {
    if (profile) {
      async function fetchIsFollow() {
        const response = await fetchApi(`profiles/follow/status?user_id=${params.id}`, "GET");
        if (response.hasOwnProperty("error")) {
          if (response.error.Error === "user does not exist") {
            setIsfollow(404)
            return
          } else if (response.error.Error === "you cant follow or unfollow youself") {
            redirect('/profile')
            return
          }
          alert(`Error get profile: ${response.error || 'Unknown error'} Status: ${response.status}`);

        } else {
          setIsfollow(response);
        }
      }

      fetchIsFollow();
    }
  }, [profile])

  const [reloadKey, setReloadKey] = useState(0);

  // const handleReload = useCallback(() => {
  //   setReloadKey((key) => key + 1);
  // }, []);


  if (!profile) return <div> Loading... </div>
  else if (profile === 404 || isFollow === 404) return <div>not found</div>

  profile["Status"] = isFollow.Status

  return (
    <>
      <aside className="feed">
        {profile.ProfileStatus === 'private' ? (
          <div>private account</div>
        ) : (
          <FetchPosts key={reloadKey} endpoint={`posts?last_id=`} lastId={0} />
        )}
      </aside>

      <div className="rightSidebar">
        <ProfileComponent profile={profile} setProfile={setProfile} />
      </div>
    </>
  );

}
