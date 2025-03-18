import { fetchApi } from "@/api/fetchApi"
import "./NotificationsStyle.css"
import { formatTime } from "@/utiles/dateFormat"
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link"
import { debounce } from "@/utiles/Debounce";

const NotificationEndpoint = "notifications" // GET user_id && last_notif_id
const AccepteReqEndpoint = "profiles/follow/accept" // POST user_id
const RejectReqEndpoint = "profiles/follow/reject" // POST user_id
const StatusEndpoint = "profiles/follow/status" // GET user_id 
// const SeenEndpoint = "notifications/seen" // POST id

const NotificationsTypes = {
    "request_following": {
        message: "New Follow Request",
        type: "follow"
    },
    "group_invitation": {
        message: "New Group Invitation",
        type: "group"
    },
    "accept_request": {
        message: "Group Invitation Accepted",
        type: "group"
    },
    "event": {
        message: "New Event",
        type: "group"
    },
    "following": {
        message: "New Follower",
        type: "follow"
    }
}

function GetNotification(LastNotifId) {
    return LastNotifId >= 0 ? fetchApi(`${NotificationEndpoint}?last_notif_id=${LastNotifId}`) : fetchApi(NotificationEndpoint)
}

function CheckStatus(UserID) {
    return fetchApi(`${StatusEndpoint}?user_id=${UserID}&rev=true`)
}

export function Notification() {
    const [data, setData] = useState([]);
    const [lastId, setLastId] = useState(null);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        async function fetchNotifications() {
            setLoading(true);
            const result = await GetNotification();
            if (!result) {
                setData([]);
                setLoading(false);
                return;
            }
            setData(result);
            setLoading(false);

            if (result) {
                if (result.length > 0) {
                    setLastId(result[result.length - 1].id);
                }
            }

        }
        fetchNotifications();
    }, []);

    const HandleScroll = useCallback(
        debounce(async (e) => {
            const bottom = e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 1;
            if (bottom && lastId && !loading) {
                setLoading(true);
                const newData = await GetNotification(lastId);
                if (newData) {
                    if (newData.length > 0) {
                        setData((prev) => [...prev, ...newData]);
                        setLastId(newData[newData.length - 1].id);
                    }
                    setLoading(false);
                }
            }
        }, 400),
        [lastId, loading]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("scroll", HandleScroll);

        return () => {
            container.removeEventListener("scroll", HandleScroll);
        };
    }, [HandleScroll]);

    return (
        <section className="notcontainer">
            <h1 className="title">Notifications</h1>
            <div className="notifications" ref={containerRef}>
                {data.map((res, index) => (
                    <NotificationResault key={index} Data={res} />
                ))}
            </div>
        </section>
    );
}
function NotificationResault({ Data }) {
    const [status, setStatus] = useState("");
    useEffect(() => {
        async function GetStatus(userid) {
            const Status = await CheckStatus(userid);
            setStatus(Status.Status);
        }
        if (Data?.UserID) {
            GetStatus(Data.UserID);
        }
    }, [Data?.UserID]);

    // if (document.getElementById(`notif-${Data.id}`)) return null

    let ImageUrl = Data.Avatar !== "undefined" && Data.Avatar
        ? Data.Avatar.startsWith("http") ? Data.Avatar : `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${Data.Avatar}`
        : process.env.NEXT_PUBLIC_GLOBAL_IMG;

    return (
        <div className="notificationcontainer" id={`notif-${Data.id}`}>
            <Link href={NotificationsTypes[Data.type].type === "group" ? "/groups/" + Data.RefId : "/profile/" + Data.UserID} className="notification">
                <div>
                    <img src={ImageUrl} alt={`${Data.FirstName} ${Data.LastName}`} />
                    <p>{`${NotificationsTypes[Data.type].message} | From ${Data.FirstName} ${Data.LastName}`}</p>
                </div>
                <h5>{formatTime(Data.creatat)}</h5>
            </Link>
            {(status === "pending" && Data.type === "request_following") && !document.getElementById(`Button-${Data.UserID}`) ? <Buttons UserID={Data.UserID} /> : null}
        </div>
    );
}

async function AccepteFollowRequest(UserID, setInvisible) {
    const formData = new FormData();
    formData.append("user_id", UserID);
    setInvisible(false)
    fetchApi(AccepteReqEndpoint, "POST", formData, true)
}

function RejectFollowRequest(UserID, setInvisible) {
    const formData = new FormData();
    formData.append("user_id", UserID);
    setInvisible(false)
    fetchApi(RejectReqEndpoint, "POST", formData, true)
}

function Buttons({ UserID }) {
    if (document.getElementById(`Button-${UserID}`)) return null
    const [isVisible, setInvisible] = useState(true);
    if (!isVisible) return null;
    return (
        <div id={`Button-${UserID}`} className="buttons">
            <button onClick={() => AccepteFollowRequest(UserID, setInvisible)} className="accepte">
                Accept
            </button>
            <button onClick={() => RejectFollowRequest(UserID, setInvisible)} className="reject">
                Reject
            </button>
        </div>
    );
}