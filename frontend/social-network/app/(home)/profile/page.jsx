"use client"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import { useEffect, useState } from "react"
import ProfileComponent from "@/components/profile/profile.jsx"
import { useParams } from "next/navigation"

export default function Profile() {
  const params = useParams()
  console.log(params);

  const [profile, setProfile] = useState(null)
  useEffect(() => {

    async function fetchProfile() {
      const response = await fetchApi("profiles", "GET")
      if (response.hasOwnProperty("error")) {
        alert(`Error: ${response.error} Status: ${response.status}`);
      }
      setProfile(response)
    }

    fetchProfile()
  }, [])
  // console.log(profile);

  if (!profile) {
    return (
      <>
        not found
      </>
    )
  }
  profile["isOwner"] = true
  return (
    <>
      <aside className="feed">
        <FetchPosts last_id={0} />
      </aside>

      <div className="rightSidebar">
        <ProfileComponent profile={profile} />
      </div>
    </>
  )
}
