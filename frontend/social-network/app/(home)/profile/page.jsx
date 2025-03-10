"use client"
import { useEffect, useState, useCallback } from "react"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import ProfileComponent from "@/components/profile/profile.jsx"
import ToastNotification from "@/components/profile/toast.jsx";
import { SkeletonLoader } from "@/components/skeletons/profile_skel.jsx"

export default function Profile() {
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

  const [open, setOpen] = useState(false)
  const [variant, setVariant] = useState("success")
  const [message, setMessage] = useState("Your message has been sent successfully!")

  const showToast = (type, msg) => {
    setVariant(type)
    setMessage(msg)
    setOpen(true)
  }

  // <SkeletonLoader />
  if (!profile) return (<>
    <aside className="feed"><SkeletonLoader /></aside>
    <div className="rightSidebar"></div>
  </>)

  profile["isOwner"] = true
  return (
    <>
      <aside className="feed">
        <ToastNotification open={open} onClose={setOpen} variant={variant} message={message} duration={3000} />
        <FetchPosts key={reloadKey} endpoint={`posts?last_id=`} lastId={0} />
      </aside >

      <div className="rightSidebar">
        {/* ProfileComponent */}
        <ProfileComponent profile={profile} setProfile={setProfile} showToast={showToast} />
      </div>
    </>
  )
}
