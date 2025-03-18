"use client"

import { useState, useEffect } from "react"
import styles from "../../styles/follow-button.module.css"
import { fetchApi } from "@/api/fetchApi"
import Link from "next/link"

export default function FollowButton({ statusFollow, profileType, setProfile, userID, showToast }) {
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState("follow")
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (statusFollow !== undefined) {
      setState(statusFollow)
      setLoading(false)
    }
  }, [statusFollow])

  useEffect(() => {
    if (profileType !== undefined) {
      setIsPrivate(profileType)
    }
  }, [profileType])

  async function Follow(userID) {
    const form = new FormData()
    form.append("followedid", userID)

    const resp = await fetchApi("profiles/follow", "POST", form, true)
    if (resp.hasOwnProperty("error")) {
      showToast("error", resp.error.Error || "Unknown error")
      setState("follow")
      return false
    }
    console.log(resp)
    return true
  }

  async function Unfollow(userID) {
    const form = new FormData()
    form.append("followedid", userID)

    const resp = await fetchApi("profiles/unfollow", "POST", form, true)
    if (resp.hasOwnProperty("error")) {
      showToast("error", resp.error.Error || "Unknown error")
      setState(state === "follow" ? "unfollow" : "waiting")
      return false
    }
    console.log(resp)
    return true
  }

  const handleClick = () => {
    if (state === "pending" || state === "waiting") return

    const previousState = state

    setState("pending")
    setTimeout(async () => {
      try {
        if (state === "follow") {
          const success = await Follow(userID)

          if (success) {
            if (isPrivate) {
              setState("waiting")
            } else {
              setState("unfollow")
              setProfile((prev) => ({
                ...prev,
                Follower: prev.Follower + 1,
              }));
            }
          } else {
            setState(previousState)
          }
        } else {
          const success = await Unfollow(userID)

          if (success) {
            setState("follow")
            setProfile((prev) => ({
              ...prev,
              Follower: prev.Follower - 1,
            }));
          } else {
            setState(previousState)
          }
        }
      } catch (error) {
        console.error("Error during follow/unfollow:", error)
        showToast("error", "An error occurred. Please try again.")
        setState(previousState)
      }
    }, 500);

  }

  // Show a loading state while waiting for data
  if (loading) {
    return (
      <button className={`${styles.followButton} ${styles.loading}`} disabled>
        <div className={styles.buttonStates}>
          <span className={`${styles.state} ${styles.active}`}>
            <svg
              className={`${styles.icon} ${styles.spinner}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading
          </span>
        </div>
      </button>
    )
  }

  return (
    <button onClick={handleClick} className={`${styles.followButton} ${styles[state]}`} disabled={state === "pending"}>
      <div className={styles.buttonStates}>
        {/* Follow State */}
        <span className={`${styles.state} ${state === "follow" ? styles.active : ""}`}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M16 11h6" />
          </svg>
          Follow
        </span>

        {/* Unfollow State */}
        <span className={`${styles.state} ${state === "unfollow" ? styles.active : ""}`}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Following
        </span>

        {/* Pending State */}
        <span className={`${styles.state} ${state === "pending" ? styles.active : ""}`}>
          <svg
            className={`${styles.icon} ${styles.spinner}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>

        {/* Waiting State */}
        <span className={`${styles.state} ${state === "waiting" ? styles.active : ""}`}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 6v6l4 2" />
          </svg>
          Requested
        </span>
      </div>
    </button>
  )
}
