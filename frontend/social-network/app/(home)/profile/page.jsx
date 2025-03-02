"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import ProfileComponent from "@/components/profile/profile.jsx"

export default function Profile() {
  const params = useParams()
  console.log(params);

  const [profile, setProfile] = useState(null)
  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi("profiles", "GET")
      if (response.hasOwnProperty("error")) {
        alert(`Error: ${response.error} Status: ${response.status}`);
      }else{
        setProfile(response)
      }
    }

    fetchProfile()
  }, [])
  // console.log(profile);

  if (!profile) return <div> Loading... </div>

  profile["isOwner"] = true
  return (
    <>
      <aside className="feed">
        <FetchPosts last_id={0} />
      </aside>

      <div className="rightSidebar">
        {/* ProfileComponent */}
        <ProfileComponent profile={profile} />
      </div>
    </>
  )
}
