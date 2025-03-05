"use client"
import { fetchApi } from '@/api/fetchApi'
import useLazyLoad from '@/hooks/lazyload'
import Link from 'next/link'
import '../../styles/mygroups.css'
import groupImage from '../../Img/group.png'
import Image from "next/image";
const fetchUserGroups = async (page) => {


    try {
        console.log("im here in fetchuser");
        const data = await fetchApi(`/groups/CreatedBy?page=${page}`, 'GET', null, false)
        console.log('API response:', data);
        console.log("in case error:", data.error);
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
            <h2 className='titleGrp'>User Groups</h2>
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
                {data.map(group => (
                    <section className="joinedGroups" key={group.id}>
                        <button className='btn'>
                            <Link href={`/groups/${group.id}`}>
                                <div className="groupCard">
                                    <Image
                                        src={groupImage}
                                        alt='Group Image'
                                        width={200}
                                        height={150}>
                                    </Image>
                                    <div className='groupInfo'>
                                        <h3>{group.name}</h3>
                                        <p>{group.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </button>
                    </section>
                ))}
                {loading && nextPage !== null && (
                    <p className="loading-more">Loading more groups...</p>
                )}
                <div ref={loaderRef}></div>
            </div>
        </div>
    )
}

export default MyGroups
