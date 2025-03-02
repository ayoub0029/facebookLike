"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import useLazyLoad from '@/hooks/lazyload'

import '../../styles/GroupRequests.css'
import Link from 'next/link';
import { data } from 'react-router-dom'

const fetchJoinedGrp = async (page) => {
    try {
        const data = await fetchApi(`groups?page=${page}`, 'GET', null, false)
        if (data.status !== undefined) {
            return { error: "login please", status: 401 }
        }
        const groups = Array.isArray(data) ? data : []
        return {
            items: groups,
            nextPage: groups.length > 0 ? page + 5 : null
        }
    } catch (err) {
        console.error(`Error fetch groups : ${err}`);
        return { items: [], nextPage: null }
    }
}

const JoinedGrp = () => {
    /*     const [DataGrp, setusergrpjoined] = useState([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
    
        useEffect(() => {
            const fetchusergrpjoined = async () => {
                try {
                    setLoading(true)
                    const data = await fetchApi('groups?page=0', 'GET', null, false)
                    if (data.status !== undefined) {
                        setError(`Error: ${data.error} (Status: ${data.status})`);
                        return;
                    }
                    console.log('User groups data:', data)
                    setusergrpjoined(data || [])
                    setError(null)
                } catch (err) {
                    console.error('Error fetching groups:', err)
                    setError('Failed to load group data')
                } finally {
                    setLoading(false)
                }
            }
            fetchusergrpjoined()
        }, [])
     */
    console.log("im here in mygroups");
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage
    } = useLazyLoad(fetchJoinedGrp)

    const leaveTheGroup = async (groupId) => {
        const [DataGrp, setusergrpjoined] = useState([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
        try {
            setLoading(true)
            await fetchApi(`groups/${groupId}`, 'DELETE', null, false)
            if (response.status !== undefined) {
                setError(`Error: ${response.error} (Status: ${response.status})`);
                return;
            }
            setusergrpjoined(DataGrp.filter(group => group.id !== groupId))
            setError(null)
        } catch (err) {
            console.error('Error leaving group:', err)
            setError('Failed to leave the group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='userGroups-container'>
            <h2>Joined Groups</h2>
            {error && <p className='error-message'>{error}</p>}
            <div
                className='scrollable-container'
                style={{
                    maxHeight: '600px',
                    overflowY: 'auto',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}
            >
                {loading && data.length === 0 && (
                    <p className='loading-message'>Loading groups...</p>
                )}
                {!error && data.length === 0 && !loading && (
                    <p className='no-groups'>No groups found</p>
                )}
                <div className='joinedGroups'>
                    {data.map(group => (
                        <div
                            className='groupCard'
                            key={`${group.id}`}
                            role='article'
                        >
                            <div className="groupInfo">
                                <h3 id={`group-name-${group.id}`}>{group.name}</h3>
                                <p>{group.description}</p>
                            </div>
                            <div className="group-actions">
                                <button
                                    className='btn btnGray'
                                    onClick={() => leaveTheGroup(group.id)}
                                >
                                    Leave the group
                                </button>
                                <button className='btn btnGray'>
                                    <Link href={`/groups/${group.id}`}>
                                        View Group
                                    </Link>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {loading && nextPage !== null && (
                    <p className="loading-more">Loading more groups...</p>
                )}
                <div
                    ref={loaderRef}
                ></div>
            </div>
        </div>
    );
};

export default JoinedGrp;