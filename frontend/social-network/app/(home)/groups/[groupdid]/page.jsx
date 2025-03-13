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
  const groupId = pathParts[pathParts.length - 1]
  const [groupProfile, setGroupProfile] = useState(null)
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    const fetchGroupProfile = async () => {
      setLoading(true)
      try {
        const response = await fetchApi(
          `/group?group=${groupId}`,
          'GET',
          null,
          false
        );
        if (response.error || response.status >= 400) {
          setError(response.error?.message || `Error: ${response.status}`);
        } else {
          setGroupProfile(response);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching Group Profile:', err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGroupProfile()
  }, [groupId, reloadKey])

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  if (loading) {
    return <div>Loading group profile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (groupProfile && (groupProfile.status === "accepted" || groupProfile.owner == window.userState.id)) {
    return (
      <>
        <div>
          <EventContainer onSuccess={handleReload} />
          <DisplayEvents key={reloadKey} />
        </div>
        <div className="rightSidebar">
          <ProfileGrp />
          <InvitUser userID={window.userState.id} />
        </div>
      </>
    )
  }
  
  return (
    <>
    {console.log(groupProfile)}
      <div className="rightSidebar">
        <ProfileGrp />
      </div>
    </>
  )
}