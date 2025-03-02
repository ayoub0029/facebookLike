"use client"
import { fetchApi } from '@/api/fetchApi'
import useLazyLoad from '@/hooks/lazyload'
import Link from 'next/link'
import '../../styles/mygroups.css'

const fetchUserGroups = async (page) => {


    try {
        console.log("im here in fetchuser");
        const data = await fetchApi(`groupsCreatedBy?page=${page}`, 'GET', null, false)
        console.log('API response:', data);
        console.log("in case error:",data.error);
        if (data.status !== undefined) {
            return { error: "login please", status: 401 }
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
}

const MyGroups = () => {
    console.log("im here in mygroups");
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage
    } = useLazyLoad(fetchUserGroups)
    
    return (
        <div className="userGroups-container">
            <h2>User Groups</h2>
            {error && <p className="error-message">{error}</p>}
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
                {loading && data.length === 0 && (
                    <p className="loading-message">Loading groups...</p>
                )}

                {!error && data.length === 0 && !loading && (
                    <p className="no-groups">No groups found</p>
                )}

                <div className="joinedGroups">
                    {data.map(group => (
                        <div
                            className="groupCard"
                            key={`${group.id}`}
                            aria-labelledby={`group-name-${group.id}`}
                            role="article"
                        >
                            <div className="groupInfo">
                                <h3 id={`group-name-${group.id}`}>{group.name}</h3>
                                <p>{group.description}</p>
                            </div>
                            <div className="group-actions">
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
    )
}

export default MyGroups