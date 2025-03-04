"use client"
import React, { useState } from 'react'
import { fetchApi } from '@/api/fetchApi'
import useLazyLoad from '@/hooks/lazyload'
import '../../styles/GroupRequests.css'
import Link from 'next/link'

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
        console.error(`Error fetch groups: ${err}`);
        return { items: [], nextPage: null }
    }
}

const JoinedGrp = () => {
    console.log("im here in mygroups");
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage,
    } = useLazyLoad(fetchJoinedGrp)

    const [leavingGroup, setLeavingGroup] = useState(false)
    const [leaveError, setLeaveError] = useState(null)

    const leaveTheGroup = async (groupId) => {
        try {
            setLeavingGroup(true)
            setLeaveError(null)
            const response = await fetchApi(`group/leav/${groupId}`, 'DELETE', null, false)
            if (response && response.status !== undefined && response.status !== 200) {
                setLeaveError(`Error: ${response.error || 'Unknown error'} (Status: ${response.status})`);
                return;
            }
            setGroupsData(groupsData.filter(group => group.id !== groupId))
        } catch (err) {
            console.error('Error leaving group:', err)
            setLeaveError('Failed to leave the group')
        } finally {
            setLeavingGroup(false)
        }
    }

    return (
        <div className='userGroups-container'>
            <h2>Joined Groups</h2>
            {(error || leaveError) && (
                <p className='error-message'>{error || leaveError}</p>
            )}
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
                        >
                            <div className="groupInfo">
                                <h3 id={`group-name-${group.id}`}>{group.name}</h3>
                                <p>{group.description}</p>
                            </div>
                            <div className="group-actions">
                                <button
                                    className='btn btnGray'
                                    onClick={() => leaveTheGroup(group.id)}
                                    disabled={leavingGroup}
                                >
                                    {leavingGroup ? 'Leaving...' : 'Leave the group'}
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
                <div ref={loaderRef}></div>
            </div>
        </div>
    );
};

export default JoinedGrp;