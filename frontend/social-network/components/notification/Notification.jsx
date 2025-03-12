import { fetchApi } from "@/api/fetchApi"
import "./NotificationsStyle.css"

const NotificationEndpoint = "notifications" // GET user_id && last_notif_id
const SeenEndpoint = "notifications/seen" // POST id

function GetNotification(UserID = 0 , LastNotifId = 0) {
    return LastNotifId ? fetchApi(`${NotificationEndpoint}?user_id=${UserID}&last_notif_id=${LastNotifId}`) : fetchApi(`${NotificationEndpoint}?user_id=${UserID}`)  
}

export function Notification() {
    return (
        <>
            <section className="notcontainer">
                <h1 className="title">Notifications</h1>
                <div className="notificationdata">
                    
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