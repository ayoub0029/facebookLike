import { fetchApi } from "@/api/fetchApi"
import "./NotificationsStyle.css"
import { formatTime } from "@/utiles/dateFormat"

const NotificationEndpoint = "notifications" // GET user_id && last_notif_id
const SeenEndpoint = "notifications/seen" // POST id

function GetNotification(UserID = 0, LastNotifId = 0) {
    return LastNotifId ? fetchApi(`${NotificationEndpoint}?user_id=${UserID}&last_notif_id=${LastNotifId}`) : fetchApi(`${NotificationEndpoint}?user_id=${UserID}`)
}


// {
//     "id": 2,
//     "FirstName": "RRR",
//     "LastName": "RRR",
//     "Avatar": "1670d53d-c9e9-43eb-b6d2-f031f606619e.jpeg",
//     "type": "following",
//     "message": "",
//     "creatat": "2025-03-14T01:32:44Z"
// }

export function Notification() {
    return (
        <>
            <section className="notcontainer">
                <h1 className="title">Notifications</h1>
                <div className="notifications">
                    <div className="notificationcontainer">
                        <div className="notification">
                            <div>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9EZNefY1fRsA4qVFTBviWyj-5KHY6U8LG0g&s" alt="" />
                                <p>contestttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttcontestttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttcontestttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttcontestttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttcontesttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</p>
                            </div>
                            <h5>{formatTime("2025-03-14T01:32:44Z")}</h5>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

function NotificationResault() {
    return (
        <div></div>
    )
}
