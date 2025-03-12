"use client"

import { fetchApi } from "@/api/fetchApi"
import useLazyLoad from "@/hooks/lazyload"
import { usePathname } from "next/navigation"
import '../../styles/eventCard.css'
import { useState, useEffect } from "react"

export default function DisplayEvents({ reloadKey }) {
    const [votedEvents, setVotedEvents] = useState({});
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const groupID = pathParts[pathParts.length - 1];
    const [voteError, setError] = useState(null);
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
            return { error: error.message || "An unexpected error occurred", status: "error" }
        }
    }

    const vote = async (e) => {
        const eventId = e.target.name;
        let choice = e.target.value;
        if (choice === "Going") choice = 1;
        else choice = 0;

        const formData = new FormData();
        formData.append("event", eventId);
        formData.append("option", choice);

        try {
            const data = await fetchApi(`group/event/vote`, "POST", formData, true);
            if (data.error || data.status >= 400) {
                console.error("Error voting on event:", data.error);
                setError(data.error?.message || `Error: ${data.status}`);
                return { error: data.error?.message || `Error: ${data.status}`, status: "error" };
            }
            setVotedEvents(prev => ({
                ...prev,
                [eventId]: choice
            }));
            setError(null);
            return { status: "success" };
        } catch (error) {
            console.error("Error voting on event:", error);
            setError(error.message || "An unexpected error occurred");
            return { error: error.message, status: "error" };
        }
    };

    const deleteVote = async (id) => {
        // console.log("Deleting vote for event:", id);

        /* try {
            const data = await fetchApi(`/group/deleteVote?eventId=${id}`, 'DELETE', null, false)
            if (data.status !== undefined) return { error: "error", status: data.status }
            
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
            // console.log(newState);
            delete newState[id];
            return newState;
        });
    }

    const checkDate = (endDate) => {
        const GivenDate = new Date(endDate);
        const CurrentDate = new Date();
        console.log("test:: ", GivenDate, CurrentDate);
        if (GivenDate >= CurrentDate) {
            return true
        } else { return false }
    }

    const getVotes = async (id) => {
        try {
            data = await fetchApi(`/group/event/votes?event=${id}`, 'GET', null, false)
            console.log(data);
            
        }catch (error) {
            console.error(error);
            return { error: error.message || "An unexpected error occurred", status: "error" }
        }
    }

    useEffect(() => {
        fetchEvents();
    }, [reloadKey]);
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
            {voteError && <p className="error-message">{voteError}</p>}
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
                                        {getVotes(event.id) &&
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
                                        }
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
