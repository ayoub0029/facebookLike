"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/GroupRequests.css'
import groupImage from '../../Img/group.png'
import useLazyLoad from '@/hooks/lazyload'
/* const fetchUserGroups = async (page) => {
    try {
        const data = await fetchApi(`/groups/CreatedBy?page=${page}`, 'GET', null, false)
        if (data.status !== undefined) {
            return { error: data.error, status: data.status }
        }
        const groups = Array.isArray(data) ? data : []
        return {
            items: groups,
            nextPage: groups.length > 0 ? page + 5 : null
        }
    } catch (err) {
        console.error('Error fetching groups:', err)
        return { items: [], nextPage: null }
    }
} */

const fetchRqsts = async (page) => {
    try {
        const data = await fetchApi(`group/applications?page=${page}`, 'GET', null, false)
        console.log("requests", data);

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
    const [reloadKey, setReloadKey] = useState(0)
    useEffect(() => {
        fetchRqsts(0);
    }, [reloadKey]);
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage
    } = useLazyLoad(fetchRqsts)

    const handleAccept = async () => {
        // const formData = new FormData()
        // formData.append("user",)
        // try {
        //     await fetchApi(`/groups/accept?id=${id}`, 'GET', null, false);
        //     setReloadKey(prevKey => prevKey + 1);
        // } catch (err) {
        //     console.error('Error accepting group request:', err);
        // }
        console.log(window.userState.id);
        
        
    };

    const handleDecline = async () => {
        try {
            await fetchApi(`/groups/decline?id=${id}`, 'DELETE', null, false);
            setReloadKey(prevKey => prevKey + 1);
        } catch (err) {
            console.error('Error declining group request:', err);
        }
    };

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
                {!loading && !error && data.length === 0 ? (
                    <p>No pending group invitations</p>
                ) : (
                    <div className="invitationRequests">
                        {data.map(request => (
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
                                        onClick={() => handleAccept()}
                                        className="btn btnGreen"
                                        title="Accept invitation"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecline()}
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