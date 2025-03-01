import style from "./profile.module.css"
import { useState } from "react"
import Modal from "./popupUsers.jsx"

export default function ProfileComponent({ profile }) {

  const [followersOpen, setFollowersOpen] = useState(false);
  const openModal1 = () => setFollowersOpen(true);
  const closeModal1 = () => setFollowersOpen(false);

  const [followengOpen, setFollowengOpen] = useState(false);
  const openModal2 = () => setFollowengOpen(true);
  const closeModal2 = () => setFollowengOpen(false);

  return profile.ProfileStatus === 'private' && !profile.isOwner ? (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : "http://localhost:8080/public/test.jpg"}
          alt={profile.Nickname} />
      </div>

      <span className={style["nickname"]}>@{profile.Nickname}</span>
      <br></br>

      <div className={style["btn_follow"]}>
        <button>follow</button>
      </div>

      <div className={style["about"]}>
        <span>Private acount</span>
      </div>
    </div>

  ) : (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : "http://localhost:8080/public/test.jpg"}
          alt={profile.Nickname} />
      </div>

      <span className={style["full_name"]}>{profile.First_Name} {profile.Last_Name}</span>
      <span className={style["nickname"]}>@{profile.Nickname}</span>
      <span className={style["date_brith"]}>{formateDOB(profile.DOB)}</span>

      <div className={style["follow"]}>
        <div onClick={openModal1}>
          <span className={style["follow_number"]}> {profile.Follower}</span>
          <span> Followers</span>
        </div>

        <div onClick={openModal2}>
          <span className={style["follow_number"]}> {profile.Follwoed}</span>
          <span> Following</span>
        </div>
      </div>

      {isShowBtnFollow(profile)}

      <div className={style["about"]}>
        <span>About Me</span>
        <p>{profile.AboutMe}</p>
      </div>

      <Modal isOpen={followersOpen} onClose={closeModal1}>
        <div className="directMessages">
          <h2 className={style.modalTitle}>Followers</h2>
          <div className="postHeader">
            <img src="http://localhost:8080/public/test.jpg" className="smallImg" />
            <p>Ayoub Lahmami</p>
          </div>
          <div className="postHeader">
            <img src="http://localhost:8080/public/test.jpg" className="smallImg" />
            <p>Ayoub Lahmami</p>
          </div>
          <div className="postHeader">
            <img src="http://localhost:8080/public/test.jpg" className="smallImg" />
            <p>Ayoub Lahmami</p>
          </div>

        </div>
      </Modal>

      <Modal isOpen={followengOpen} onClose={closeModal2}>
        <h2 className={style.modalTitle}>Followeng</h2>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
      </Modal>
    </div>
  )
}

function formateDOB(date) {
  var d = new Date(date)
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`
}

function isShowBtnFollow(profile) {
  if (!profile.isOwner) {
    return (
      <div className={style["btn_follow"]}>
        <button>follow</button>
      </div>
    )
  }
}