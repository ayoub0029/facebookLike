"use client"
import React, { useState, useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/GroupRequests.css'
import Link from 'next/link';

const JoinedGrp = () => {
    const [DataGrp, setusergrpjoined] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchusergrpjoined = async () => {
            try {
                setLoading(true)
                const data = await fetchApi('groupsJoinedBy?page=0', 'GET', null, false)
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

    const leaveTheGroup = async (groupId) => {
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
        <div>
            <h2>
                User Groups
            </h2>
            {loading && <p>Loading groups...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && DataGrp.length === 0 ? (
                <p className="no-groups">No groups found</p>
            ) : (
                <div className="joinedGroups">
                    {DataGrp.map(group => (
                        <div className="groupCard" key={group.id}>
                            <img
                                src="../../Img/group.png"
                                alt="Group Avatar"
                            />
                            <div className="groupInfo">
                                <h3>{group.name}</h3>
                                <p>
                                    {group.description}
                                </p>
                            </div>
                            <div>
                                <button
                                    className='btn btnGray'
                                    onClick={() => leaveTheGroup(group.id)}
                                >
                                    Leave the group
                                </button>

                                <button
                                    className='btn btnGray'
                                    onClick={() => {
                                        console.log("id:", group.id)
                                    }}
                                >
                                    <Link href={`/groups/${group.id}`}>
                                        View Group
                                    </Link>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default JoinedGrp;