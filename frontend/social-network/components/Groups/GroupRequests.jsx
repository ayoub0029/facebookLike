"use client"

import React, { useState, useEffect } from 'react';
import '../../styles/GroupRequests.css';
import { fetchApi } from '@/api/fetchApi';
const GroupRequests = () => {
    const [groupRequests, setGroupRequests] = useState([]);

    useEffect(() => {
        const fetchGroupRequests = async () => {
            try {
                // khassni handler bach nfetchi les group requests
                const data = await fetchApi('GET', '/users', null, false);
                console.log('Group requests data:', data);
                setGroupRequests(data || []);
            } catch (err) {
                console.error('Error fetching group requests:', err);
            }
        };

        fetchGroupRequests();
    }, []);

    const handleAccept = (id) => {
        setGroupRequests(groupRequests.filter(request => request.id !== id));
        // khassni handler bach n3tihom accept
    };

    const handleDecline = (id) => {
        setGroupRequests(groupRequests.filter(request => request.id !== id));
        // khassni handler bach n3tihom decline
    };

    return (
        <div className="group-invitations-container">
            <h2 className="group-invitations-title">
                Invitations & Requests
            </h2>
            {groupRequests.length === 0 ? (
                <p className="no-invitations">No pending group invitations</p>
            ) : (
                <div className="invitationRequests">
                    {groupRequests.map(request => (
                        <div key={request.id} className="invitationCard">
                            <img
                                src={request.image}
                                alt={request.name}
                                className="group-avatar"
                            />
                            <div className="invitation-details">
                                <h3 className="group-name">{request.name}</h3>
                                <p className="member-count">
                                    {request.phone} members
                                </p>
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
    );
};

export default GroupRequests;
