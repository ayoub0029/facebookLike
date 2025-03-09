"use client"
import ProfileGrp from '../../../../components/Groups/ProfileGrp'
import EventContainer from '../../../../components/Groups/CreateEvent'
import DisplayEvents from '../../../../components/Groups/DisplayEvents'
import { usePathname } from "next/navigation"
import { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'

export default function Profile() {
  const fullPath = usePathname()
  const pathParts = fullPath.split("/")
  const pathname = pathParts[pathParts.length - 1]
  const [groupProfile, setGroupProfile] = useState(null)
  /* const [refreshEvents, setRefreshEvents] = useState(0) */
  
  useEffect(() => {
    const fetchGroupProfile = async () => {
      try {
        const data = await fetchApi(`/group?group=${pathname}`, 'GET', null, false)
        setGroupProfile(data || null)
      } catch (err) {
        console.error('Error fetching Group Profile:', err)
      }
    }
    fetchGroupProfile()
  }, [pathname])
  
  /* const handleEventCreated = () => {
    console.log("Event created, triggering refresh")
    setRefreshEvents(prev => prev + 1)
  } */
  
  if (groupProfile && (groupProfile.status === "accepted" || groupProfile.status === "owner")) {
    return (
      <>
        <div>
          <EventContainer /* onAction={handleEventCreated} */ />
          <DisplayEvents /* key={refreshEvents} */ />
        </div>
        <div className="rightSidebar">
          <ProfileGrp />
        </div>
      </>
    )
  }
  
  return (
    <>
      <div className="rightSidebar">
        <ProfileGrp />
      </div>
    </>
  )
}