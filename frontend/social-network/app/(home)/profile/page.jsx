"use client"
import { fetchApi } from "@/api/fetchApi.jsx"
import { FetchPosts } from "@/components/Posts/FetchPosts"
import { useEffect, useState } from "react"
import style from "./profile.module.css"

export default function Profile() {

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
  console.log(profile);
  
  const [followrs, setFollowers] = useState(null)
  useEffect(() => {

    async function fetchFollowers() {
      const response = await fetchApi("profiles", "GET")
      if (response.hasOwnProperty("error")) {
        alert(`Error: ${response.error} Status: ${response.status}`);
      }
      setFollowers(response)
    }

    fetchFollowers()
  }, [])

  if(!profile){
    return(
      <>
      not found
      </>
    )
  }

  return (
    <>
      <aside className="feed">
        <FetchPosts last_id={0} />
      </aside>

      <div className="rightSidebar">
        <div className={style["profiletHeader"]}>
          <div >
            <img src="http://localhost:8080/public/logo.png" alt="Profile Image" />
          </div>
          <span className={style["full_name"]}>{profile.First_Name} {profile.Last_Name}</span>
          <span className={style["nickname"]}>@{profile.Nickname}</span>
          <span className={style["date_brith"]}>{formateDOB(profile.DOB)}</span>

          <div className={style["follow"]}>
            <div>
              <span className={style["follow_number"]}> 1321k</span>
              <span> Followers</span>
            </div>

            <div>
              <span className={style["follow_number"]}> 56</span>
              <span> Following</span>
            </div>
          </div>

          <div className={style["btn_follow"]}>
            <button>follow</button>
          </div>

          <div className={style["about"]}>
            <span>About Me</span>
            <p>{profile.AboutMe}</p>
          </div>
        </div>
      </div>
    </>
  )
}

function formateDOB(date) {
  var d = new Date(date)
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`
}