"use client"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import { useEffect, useState } from "react"
import ProfileComponent from "@/components/profile/profile.jsx"
import { useParams } from "next/navigation"

export default function Profile() {
  const params = useParams();

  const [profile, setProfile] = useState(null);
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi(`profiles?user_id=${params.id}`, "GET");
      if (response.hasOwnProperty("error")) {
        alert(`Error get profile: ${response.error || 'Unknown error'} Status: ${response.status}`);
      } else {
        setProfile(response);
      }
    }

    fetchProfile();
  }, [params.id]);
  console.log(params.id);

  const [isFollow, setIsfollow] = useState(false);
  useEffect(() => {
    if (profile) {
      async function fetchIsFollow() {
        const response = await fetchApi(`profiles/follow/status?user_id=${params.id}`, "GET");
        if (response.hasOwnProperty("error")) {
          alert(`Error followe check: ${response.error} Status: ${response.status}`);
        } else {
          setIsfollow(response);
        }
      }

      fetchIsFollow();
    }
  }, [profile])

  if (!profile) return <div> Loading... </div>
  console.log(isFollow);

  profile["Status"] = isFollow.Status

  return (
    <>
      <aside className="feed">
        <FetchPosts last_id={0} />
      </aside>

      <div className="rightSidebar">
        <ProfileComponent profile={profile} />
      </div>
    </>
  );
}
