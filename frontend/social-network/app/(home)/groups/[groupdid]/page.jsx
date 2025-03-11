"use client"
import ProfileGrp from '../../../../components/Groups/ProfileGrp'
import EventContainer from '../../../../components/Groups/CreateEvent'
import DisplayEvents from '../../../../components/Groups/DisplayEvents'
import InvitUser from '../../../../components/Groups/InvitUser'
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '@/api/fetchApi'

export default function Profile() {
  const fullPath = usePathname()
  const pathParts = fullPath.split("/")
  const pathname = pathParts[pathParts.length - 1]
  const [groupProfile, setGroupProfile] = useState(null)
  const [reloadKey, setReloadKey] = useState(0);

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

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);


  if (groupProfile && (groupProfile.status === "accepted" || groupProfile.status === "owner")) {
    return (
      <>
        <div>
          <EventContainer onSuccess={handleReload} />
          <DisplayEvents key={reloadKey} />
        </div>
        <div className="rightSidebar">
          <ProfileGrp />
          <InvitUser userID={window.userState.id}/>
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