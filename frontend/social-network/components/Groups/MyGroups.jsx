"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/GroupRequests.css'
import Link from 'next/link';

const UserGroups = () => {
    const [userGroups, setUserGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                setLoading(true)
                // Fetch groups of the users from the API endpoint
                const data = await fetchApi('groups?page=0', 'GET', null, false)
                console.log('User groups data:', data)
                setUserGroups(data || [])
                setError(null)
            } catch (err) {
                console.error('Error fetching groups:', err)
                setError('Failed to load group data')
            } finally {
                setLoading(false)
            }
        }
        fetchUserGroups()
    }, [])

    const leaveTheGroup = async (groupId) => {
        try {
            setLoading(true)
            await fetchApi(`groups/${groupId}`, 'DELETE', null, false)
            setUserGroups(userGroups.filter(group => group.ID !== groupId))
            setError(null)
        } catch (err) {
            console.error('Error leaving group:', err)
            setError('Failed to leave the group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>
                User Groups
            </h2>
            {loading && <p>Loading groups...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && userGroups.length === 0 ? (
                <p className="no-groups">No groups found</p>
            ) : (
                <div className="joinedGroups">
                    {userGroups.map(group => (
                        <div className="groupCard" key={group.ID}>
                            <img
                                src="../../Img/group.png"
                                alt="Group Avatar"
                            />
                            <div className="groupInfo">
                                <h3>{group.Name}</h3>
                                <p>
                                    {group.Description}
                                </p>
                            </div>
                            <div>
                                <button
                                    className='btn btnGray'
                                    onClick={() => leaveTheGroup(group.ID)}
                                >
                                    Leave the group
                                </button>
                                <Link href={`/groups/${group.ID}`} className='btn btnGray'>
                                    View Group
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserGroups;