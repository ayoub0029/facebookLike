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
    const [votesData, setVotesData] = useState({});
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
        let option;
        if (choice === "Going") option = 1;
        else option = 0;
        
        const formData = new FormData();
        formData.append("event", eventId);
        formData.append("option", option);

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
        if (GivenDate >= CurrentDate) {
            return true
        } else { return false }
    }

    const getVotes = async (id) => {
        try {
            const data = await fetchApi(`/group/event/votes?event=${id}`, 'GET', null, false);
            setVotesData(prev => ({
                ...prev,
                [id]: data
            }));

            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    useEffect(() => {
        const eventIds = Object.keys(votedEvents);
        if (eventIds.length > 0) {
            eventIds.forEach(id => {
                if (!votesData[id]) {
                    getVotes(id);
                }
            });
        }
    }, [votedEvents, votesData])
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
                                {votedEvents[event.id] && (
                                    <>
                                        <div className="percentageBars">
                                            <div className="percentageLabel">
                                                Going {votesData[event.id]?.going || 0}
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg">
                                                <rect
                                                    className="svgFillGreen"
                                                    x="0"
                                                    y="0"
                                                    width={`${votesData[event.id] ?
                                                        (votesData[event.id].going / (votesData[event.id].going + votesData[event.id].notgoing) * 100) || 0 : 0}%`}
                                                    height="20"
                                                    rx="5"
                                                    ry="5">
                                                </rect>
                                            </svg>
                                            <div className="percentageLabel">
                                                Not Going {votesData[event.id]?.notgoing || 0}
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg">
                                                <rect
                                                    className="svgFillRed"
                                                    x="0"
                                                    y="0"
                                                    width={`${votesData[event.id] ?
                                                        (votesData[event.id].notgoing / (votesData[event.id].going + votesData[event.id].notgoing) * 100) || 0 : 0}%`}
                                                    height="20"
                                                    rx="5"
                                                    ry="5">
                                                </rect>
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
                                )}
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
