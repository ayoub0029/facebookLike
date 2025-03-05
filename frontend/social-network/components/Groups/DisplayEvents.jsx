"use client"

import { fetchApi } from "@/api/fetchApi"
import useLazyLoad from "@/hooks/lazyload"
import { usePathname } from "next/navigation"

export default function DisplayEvents() {
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const groupID = pathParts[pathParts.length - 1];
    const fetchEvents = async (page) => {
        try {
            const data = await fetchApi(`/group/events?group=${groupID}&page=${page}`, 'GET', null, false)
            if (data.status !== undefined) {
                return { error: "error", status: data.status }
            }
            const events = Array.isArray(data) ? data : []
            return {
                items: events,
                nextPage: events.length > 0 ? page + 5 : null
            }
        } catch (error) {
            console.error(error);
            return { items: {}, nextPage: null }
        }
    }
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage
    } = useLazyLoad(fetchEvents)
    return (
        <div className="groupEvents-container">
            <h2>Events</h2>
            {error && <p className="error-message">{error}</p>}
            <div
                className="scrollable-container"
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}
            >
                {loading && data.lenght === 0 && (<p className="loading-message">Loading events...</p>)}
                {!error && data.length === 0 && !loading && (
                    <p className="no-events">No events found</p>
                )}
                <div className="groupEvents">
                    {data.map(event => (
                        <div
                            className="eventsCard"
                            key={`${event.id}`}
                            aria-labelledby={`event-name-${event.id}`}
                            role="article"
                        >
                            <div className="eventInfo">
                                <h3 id={`event-name-${event.id}`}>{event.title}</h3>
                                <p>{event.description}</p>
                                <p>{event.startdate}</p>
                                <p>{event.enddate}</p>
                            </div>
                            {/*  <div className="event-actions">
                            <button className='btn btnGray' onClick={Going}>
                                Going
                            </button>
                            <button className='btn btnGray' onClick={notGoing}>
                                Not going
                            </button>
                        </div> */}
                        </div>
                    ))}
                    {loading && nextPage !== null && (
                        <p className="loading-more">Loading more groups...</p>
                    )}
                    <div ref={loaderRef}>
                    </div>
                </div>
            </div>
        </div>
    )
}
/* [
  {
    "id": 3,
    "groupid": 1,
    "ownerid": 3,
    "title": "sfrgthry",
    "description": "etrhy",
    "startdate": "2025-03-11T00:00:00Z",
    "enddate": "2025-03-15T00:00:00Z",
    "createdat": "2025-03-03T20:41:01Z"
  },
  {
    "id": 4,
    "groupid": 1,
    "ownerid": 3,
    "title": "wef",
    "description": "qwef",
    "startdate": "2025-03-04T00:00:00Z",
    "enddate": "2025-03-08T00:00:00Z",
    "createdat": "2025-03-03T20:43:12Z"
  }
] */