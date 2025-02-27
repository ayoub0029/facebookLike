import style from "./profile.module.css"

export default function ProfileComponent({profile}) {
    console.log(profile);
    
    return (
        <div className={style["profiletHeader"]}>
            <div >
                <img src="http://localhost:8080/public/logo.png" alt="Profile Image" />
            </div>
            <span className={style["full_name"]}>{profile.First_Name} {profile.Last_Name}</span>
            <span className={style["nickname"]}>@{profile.Nickname}</span>
            <span className={style["date_brith"]}>{formateDOB(profile.DOB)}</span>

            <div className={style["follow"]}>
                <div>
                    <span className={style["follow_number"]}> {profile.Follower}</span>
                    <span> Followers</span>
                </div>


                <div>
                    <span className={style["follow_number"]}> {profile.Follwoed}</span>
                    <span> Following</span>
                </div>
            </div>

            <div className={style["btn_follow"]}>
                <button>follow</button>
            </div>

            <div className={style["about"]}>
                <span>About Me</span>
                <p>{profile.AboutMe}</p>
            </div>
        </div>
    )
}

function formateDOB(date) {
    var d = new Date(date)
    return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`
  }