"use client"

import { fetchApi } from "@/api/fetchApi"
import useLazyLoad from "@/hooks/lazyload"
import { usePathname } from "next/navigation"
import '../../styles/eventCard.css'
import { useState } from "react"

export default function DisplayEvents({ refreshTrigger }) {
    // Track votes by event ID instead of a single boolean
    const [votedEvents, setVotedEvents] = useState({});
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const groupID = pathParts[pathParts.length - 1];

    const fetchEvents = async (page) => {
        try {
            const data = await fetchApi(`/group/events?group=${groupID}&page=${page}`, 'GET', null, false)
            if (data.status !== undefined) {
                return { error: data.error, status: data.status }
            }
            const events = Array.isArray(data) ? data : []
            return {
                items: events,
                nextPage: events.length > 0 ? page + 5 : null
            }
        } catch (error) {
            console.error(error);
            return { error: data.error, status: data.status }
        }
    }

    const vote = async (e) => {
        const eventId = e.target.name;
        const choice = e.target.value;

        /* try {
            const data = await fetchApi(`/group/vote?choice=${choice}&eventId=${eventId}`)
            if (data.status !== undefined) return { error: "error", status: data.status }
            
            // Update state only after successful API call
            setVotedEvents(prev => ({
                ...prev,
                [eventId]: choice
            }));
            
        } catch (error) {
            console.error(error);
            return { error: data.error, status: data.status }
        } */

        setVotedEvents(prev => ({
            ...prev,
            [eventId]: choice
        }));
    }

    const deleteVote = async (id) => {
        console.log("Deleting vote for event:", id);

        /* try {
            const data = await fetchApi(`/group/deleteVote?eventId=${id}`, 'DELETE', null, false)
            if (data.status !== undefined) return { error: "error", status: data.status }
            
            // Remove this event from voted events after successful API call
            setVotedEvents(prev => {
                const newState = {...prev};
                delete newState[id];
                return newState;
            });
            
        } catch (error) {
            console.error(error);
            return { error: data.error, status: data.status }
        } */

        setVotedEvents(prev => {
            const newState = { ...prev };
            console.log(newState);
            delete newState[id];
            return newState;
        });
    }

    const checkDate = (endDate) => {
        const GivenDate = new Date(endDate);
        const CurrentDate = new Date();
        CurrentDate.setHours(0, 0, 0, 0);
        if (GivenDate >= CurrentDate) {
            return true
        } else { return false }
    }

    /* useEffect(() => {
        fetchEvents();
      }, [refreshTrigger]); */
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
                    maxHeight: '100%',
                    overflowY: 'auto',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}
            >
                {loading && data.length === 0 && (<p className="loading-message">Loading events...</p>)}
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
                            <div className="event">
                                <h4 id={`event-name-${event.id}`}>{event.title}</h4>
                                <p>{event.description}</p>
                                <div className="eventDate">
                                    <span>Start Date: {event.startdate.substring(0, 16).replace('T', ' ')}</span>
                                    <span>End Date: {event.enddate.substring(0, 16).replace('T', ' ')}</span>
                                </div>
                                {!votedEvents[event.id] && checkDate(event.startdate) &&
                                    <div className="eventOptions">
                                        <label>
                                            <input
                                                className="radio"
                                                type="radio"
                                                name={`${event.id}`}
                                                value="Going"
                                                onChange={vote}
                                            />
                                            Going
                                        </label>
                                        <label>
                                            <input
                                                className="radio"
                                                type="radio"
                                                name={`${event.id}`}
                                                value="NotGoing"
                                                onChange={vote}
                                            />
                                            Not Going
                                        </label>
                                    </div>
                                }

                                {votedEvents[event.id] &&

                                    <>
                                        <div className="percentageBars">
                                            <div className="percentageLabel">Going (60)</div>
                                            <svg xmlns="http://www.w3.org/2000/svg">
                                                <rect className="svgFillGreen" x="0" y="0" width="60%" height="20" rx="5" ry="5"></rect>
                                            </svg>
                                            <div className="percentageLabel">Not Going (40)</div>
                                            <svg xmlns="http://www.w3.org/2000/svg">
                                                <rect className="svgFillRed" x="0" y="0" width="40%" height="20" rx="5" ry="5"></rect>
                                            </svg>
                                        </div>
                                        {checkDate(event.startdate) && (
                                            <button
                                                className="btn btnGray"
                                                onClick={() => deleteVote(event.id)}
                                            >
                                                Delete My Vote
                                            </button>
                                        )}
                                    </>
                                }
                            </div>
                        </div>
                    ))}
                    {loading && nextPage !== null && (
                        <p className="loading-more">Loading more events...</p>
                    )}
                    <div ref={loaderRef}>
                    </div>
                </div>
            </div>
        </div>
    )
}