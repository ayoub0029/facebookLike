"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/GroupRequests.css'
import useLazyLoad from '@/hooks/lazyload'

const fetchRqsts = async (page) => {
    try {
        const data = await fetchApi(`group/applications?page=${page}`, 'GET', null, false)
        console.log("requests", data)

        if (data.status !== undefined) {
            return { error: data.error, status: data.status }
        }
        const request = Array.isArray(data) ? data : []
        return {
            items: request,
            nextPage: request.length > 0 ? page + 5 : null
        }
    } catch (err) {
        console.error('Error fetching group requests:', err)
        return { items: [], nextPage: null }
    }
}

const GroupRequests = () => {
    const [requests, setRequests] = useState([])
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage
    } = useLazyLoad(fetchRqsts)
    useEffect(() => {
        if (data) {
            setRequests(data)
        }
    }, [data])

    const handleAccept = async (grpID, usrID) => {
        const formData = new FormData()
        formData.append("user", usrID)
        formData.append("group", grpID)

        try {
            await fetchApi(`group/accepte`, 'POST', formData, true)
            setRequests(prevRequests =>
                prevRequests.filter(req => !(req.groupID === grpID && req.userID === usrID))
            )
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
            setRequests(prevRequests =>
                prevRequests.filter(req => !(req.groupID === grpID && req.userID === usrID))
            )
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
            <div
                className="scrollable-container"
                style={{
                    maxHeight: '600px',
                    overflowY: 'auto',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}
            >
                {!loading && !error && requests.length === 0 ? (
                    <p>No pending group invitations</p>
                ) : (
                    <div className="invitationRequests">
                        {requests.map(request => (
                            <div key={request.id} className="invitationCard">
                                {console.log(request)}
                                {request.state === "request" &&
                                    < div className="invitation-details">
                                        <h3 className="group-name">Request from {request.fullName}</h3>
                                    </div>
                                }
                                {request.state === "pending" &&
                                    < div className="invitation-details">
                                        {console.log("ra00:", request)}
                                        <h3 className="group-name">Invitation from {request.name}</h3>
                                    </div>
                                }
                                <div className="invitation-actions">
                                    <button
                                        onClick={() => handleAccept(request.groupID, request.userID)}
                                        className="btn btnGreen"
                                        title="Accept invitation"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecline(request.groupID, request.userID)}
                                        className="btn btnRed"
                                        title="Decline invitation"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                        {loading && nextPage !== null && (
                            <p className="loading-more">Loading more groups...</p>
                        )}
                        <div ref={loaderRef}></div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default GroupRequests
