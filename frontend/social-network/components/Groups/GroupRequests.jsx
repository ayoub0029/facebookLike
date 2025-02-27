"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/GroupRequests.css'

const GroupRequests = () => {
    const [groupRequests, setGroupRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchGroupRequests = async () => {
            try {
                setLoading(true)
                // Fetch group requests from the API endpoint
                const data = await fetchApi('GET', '/users', null, false)
                console.log('Group requests data:', data)
                setGroupRequests(data || [])
                setError(null)
            } catch (err) {
                console.error('Error fetching group requests:', err)
                setError('Failed to load group requests')
            } finally {
                setLoading(false)
            }
        }
        fetchGroupRequests()
    }, [])

    const handleAccept = async (id) => {
        try {
            await fetchApi('GET', `/groups/accept?${id}`, null, false)
            setGroupRequests(groupRequests.filter(request => request.id !== id))
        } catch (err) {
            console.error('Error accepting group request:', err)
        }
    }

    const handleDecline = async (id) => {
        try {
            await fetchApi('DELETE', `/groups/decline?${id}`, null, false)
            setGroupRequests(groupRequests.filter(request => request.id !== id))
        } catch (err) {
            console.error('Error declining group request:', err)
        }
    }

    return (
        <div className="group-invitations-container">
            <h2 className="group-invitations-title">
                Invitations & Requests
            </h2>
            {loading && <p>Loading group invitations...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && groupRequests.length === 0 ? (
                <p>No pending group invitations</p>
            ) : (
                <div className="invitationRequests">
                    {groupRequests.map(request => (
                        <div key={request.id} className="invitationCard">
                            <img
                                src={request.image || "../../Img/group.png"}
                                alt={request.name}
                                className="group-avatar"
                            />
                            <div className="invitation-details">
                                <h3 className="group-name">Invitation from {request.name}</h3>
                            </div>
                            <div className="invitation-actions">
                                <button
                                    onClick={() => handleAccept(request.id)}
                                    className="btn btnGreen"
                                    title="Accept invitation"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleDecline(request.id)}
                                    className="btn btnRed"
                                    title="Decline invitation"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default GroupRequests