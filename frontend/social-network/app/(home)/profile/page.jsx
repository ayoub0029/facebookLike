"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import ProfileComponent from "@/components/profile/profile.jsx"

export default function Profile() {
  const params = useParams()

  const [profile, setProfile] = useState(null)
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi("profiles", "GET")
      if (response.hasOwnProperty("error")) {
        alert(`Error: ${response.error} Status: ${response.status}`);
      } else {
        setProfile(response)
      }
    }

    fetchProfile()
  }, [])
  // console.log(profile);
  const [reloadKey, setReloadKey] = useState(0);

  // const handleReload = useCallback(() => {
  //   setReloadKey((key) => key + 1);
  // }, []);

  if (!profile) return <div> Loading... </div>

  profile["isOwner"] = true
  return (
    <>
      <aside className="feed">
        <FetchPosts key={reloadKey} endpoint={`posts?last_id=${profile.Id}`} lastId={0} />
      </aside>

      <div className="rightSidebar">
        {/* ProfileComponent */}
        <ProfileComponent profile={profile} />
      </div>
    </>
  )
}
