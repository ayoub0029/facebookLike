"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { fetchApi } from "@/api/fetchApi"
import groupImage from '../../Img/group.png'
import Image from "next/image"
import '../../styles/Groups.css'
import Link from "next/link"

export default function ProfileGrp({ onSuccess }) {
    const fullPath = usePathname()
    const pathParts = fullPath.split("/")
    const pathname = pathParts[pathParts.length - 1]

    const [groupProfile, setGroupProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stateChange, setStateChange] = useState(null)
    useEffect(() => {
        const fetchGroupProfile = async () => {
            try {
                setLoading(true)
                const data = await fetchApi(`/group?group=${pathname}`, 'GET', null, false)
                setGroupProfile(data || null)
                setError(null)
            } catch (err) {
                console.error('Error fetching Group Profile:', err)
                setError('Failed to load group data')
            } finally {
                setLoading(false)
            }
        }

        fetchGroupProfile()
    }, [pathname, stateChange])

    const requestJoin = async (id) => {
        try {
            const formData = new FormData();
            formData.append("group", id.toString());
            const data = await fetchApi('group/join', 'POST', formData, true);

            if (data.status !== undefined) {
                console.error('Error requesting to join group')
                setError(data.error || "Failed to send join request")
                return
            }
            setStateChange("pending")
        } catch (error) {
            console.error('Error requesting to join group:', error)
            setError('Failed to send join request')
        }
    }

    const handleAccept = async (grpID, usrID) => {
        const formData = new FormData()
        formData.append("user", usrID)
        formData.append("group", grpID)
        try {
            await fetchApi(`group/accepte`, 'POST', formData, true)
            onSuccess()
        } catch (err) {
            console.error('Error accepting group request:', err)
        }
    }

    const handleDecline = async (grpID, usrID) => {
        const formData = new FormData()
        formData.append("user", usrID)
        formData.append("group", grpID)
        try {
            await fetchApi(`group/reject`, 'POST', formData, true)
            onSuccess()
        } catch (err) {
            console.error('Error declining group request:', err)
        }
    }

    if (loading) {
        return <p className="loading">Loading group data...</p>
    }

    if (error) {
        return <p className="error">{error}</p>
    }

    if (!groupProfile) {
        return <p className="empty-state">No group data found</p>
    }

    return (
        <div className="ProfileContainer">
            <div className="GroupHeader">
                <Image
                    className="groupImage"
                    src={groupImage}
                    alt={`${groupProfile.name || 'Group'} Image`}
                    width={200}
                    height={150}
                />
                <div className="groupInfos">
                    <h1>{groupProfile.name || 'Unknown Group'}</h1>
                    <h3 className="GroupDescription">
                        {groupProfile.description || 'No description available'}
                    </h3>
                    <p className="MemberCount">
                        {console.log(groupProfile)}
                        {`${groupProfile.members} Members`}
                    </p>
                    {groupProfile.status === "nothing" && groupProfile.owner != window.userState.id && (
                        <div className="reqToJoin">
                            <button onClick={() => requestJoin(groupProfile.id)} className="btn btnGreen">
                                +Join
                            </button>
                        </div>
                    )}
                    {groupProfile.status === "pending" && (
                        <div className="invitation-actions">
                            {console.log(groupProfile)}
                            <button
                                onClick={() => handleAccept(groupProfile.id, window.userState.id)}
                                className="btn btnGreen"
                                title="Accept invitation"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleDecline(groupProfile.id, window.userState.id)}
                                className="btn btnRed"
                                title="Decline invitation"
                            >
                                Decline
                            </button>
                        </div>
                    )}
                    {(groupProfile.status === "accept" || groupProfile.owner === window.userState.id) && (
                        <div className='groupCard'>
                            <button className='btn btnGreen'>
                                <Link href={`/chats/group?group_id=${pathname}&page=0`} style={{ textDecoration: 'none' }}>
                                    Group Chat
                                </Link>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
