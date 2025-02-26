"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import { useRouter } from 'next/navigation';
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
                const data = await fetchApi('GET', '/users', null, false)
                console.log('User data:', data)
                setUserGroups(data || [])
                setError(null)
            } catch (err) {
                console.error('Error fetching users:', err)
                setError('Failed to load user data')
            } finally {
                setLoading(false)
            }
        }
        fetchUserGroups()
    }, [])

    const LeaveTheGroup = async (id) => {
        setUserGroups(userGroups.filter(user => user.id !== id))
        /* try {
            setLoading(true)
            const data = await fetchApi('DELETE', `/groups/${id}`, null, false)
            console.log('User data:', data)
            setError(null)
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('Failed to load user data')
        } finally {
            setLoading(false)
        } */
    }
    
    const router = useRouter();
    const GroupDetail = async (id) => {
        /* try {
            setLoading(true)
            const data = await fetchApi('GET', `/groups/${id}`, null, false)
            console.log('User data:', data)
            setError(null)
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('Failed to load user data')
        } finally {
            setLoading(false)
        } */
        router.push(`/groups/${id}`);
    }

    return (
        <div className="user-groups-container">
            <h2 className="user-groups-title">
                User Contacts
            </h2>
            {loading && <p>Loading users...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && userGroups.length === 0 ? (
                <p className="no-groups">No users found</p>
            ) : (
                <div className="joinedGroups">
                    {userGroups.map(user => (
                        <>
                            <div className="groupCard">
                                <Link
                                    key={user.id}
                                    href={`https://jsonplaceholder.typicode.com/users/${user.id}`}
                                    className="group-item"
                                >
                                    <img
                                        src="../../Img/group.png"
                                        alt="User Avatar"
                                    />
                                    <div className="groupInfo">
                                        <h3 className="group-name">{user.name}</h3>
                                        <p className="member-count">
                                            {user.phone}
                                        </p>
                                        <p className="group-email">
                                            {user.email}
                                        </p>
                                    </div>
                                </Link>
                                <button className='btn btnGray' onClick={() => {
                                    LeaveTheGroup(user.id)
                                }}>Leave the group</button>
                                <button className='btn btnGray' onClick={() => {
                                    GroupDetail(user.id)
                                }}>View Group</button>
                            </div>
                        </>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserGroups;
