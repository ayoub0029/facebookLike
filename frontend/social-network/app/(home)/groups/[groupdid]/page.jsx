"use client"
import ProfileGrp from '../../../../components/Groups/ProfileGrp'
import EventContainer from '../../../../components/Groups/CreateEvent'
import DisplayEvents from '../../../../components/Groups/DisplayEvents'
import InvitUser from '../../../../components/Groups/InvitUser'
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '@/api/fetchApi'
import "../../../../styles/globals.css"
import GroupById from '@/components/Groups/grpPost'
export default function Profile() {
  const fullPath = usePathname()
  const pathParts = fullPath.split("/")
  const groupId = pathParts[pathParts.length - 1]
  const [groupProfile, setGroupProfile] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [section, setSection] = useState("post")
  const [hamberMenu, setHamberMenu] = useState(false);

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

  const toggle = (state) => {
    setSection(state);
  }

  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  if (loading) {
    return <div>Loading group profile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (groupProfile && (groupProfile.status === "accepted" || groupProfile.owner === window.userState.id)) {
    return (
      <>
        <div className='grpContainer'>
          <div className="feedTabs" >
            <button
              id="postFeedTab"
              className={`tab ${section === "post" ? "active" : ""}`}
              onClick={() => toggle("post")}
            >
              Post Feed
            </button>
            <button
              id="eventFeedTab"
              className={`tab ${section === "event" ? "active" : ""}`}
              onClick={() => toggle("event")}
            >
              Events
            </button>
          </div>
          {section === "post" && (
            <div>
              <GroupById groupId={groupId} />
            </div>
          )}
          {section === "event" && (
            <>
              <div>
                <button onClick={toggleMenu} className="rightMenuToggle">
                  <i className="fas fa-bars"></i>
                </button>
                <EventContainer onSuccess={handleReload} />
                <DisplayEvents key={reloadKey} />
              </div>
              {hamberMenu === "show" && <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
                <ProfileGrp />
                <InvitUser userID={window.userState.id} />
              </div>}
            </>
          )}
        </div >
        <div className="rightSidebar">
          <ProfileGrp />
          <InvitUser userID={window.userState.id} />
        </div>
      </>
    )
  }
  if (groupProfile && groupProfile.status !== "accepted" && groupProfile.owner !== window.userState.id) {
    return (
      <>
        <div className="rightSidebar">
          <ProfileGrp />
        </div>
      </>
    )
  }
} 