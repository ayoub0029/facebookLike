import style from "./profile.module.css"
import { useState } from "react"
import Modal from "./popupUsers.jsx"

export default function ProfileComponent({ profile }) {

  const [folloersOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
        <div onClick={openModal}>
          <span className={style["follow_number"]}> {profile.Follower}</span>
          <span> Followers</span>
        </div>

        <div onClick={openModal}>
          <span className={style["follow_number"]}> {profile.Follwoed}</span>
          <span> Following</span>
        </div>
      </div>

      {isShowBtnFollow(profile)}

      <div className={style["about"]}>
        <span>About Me</span>
        <p>{profile.AboutMe}</p>
      </div>

      <Modal isOpen={folloersOpen} onClose={closeModal}>
        <h2 className={style.modalTitle}>Followers</h2>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
        <p>This is your custom popup content!</p>
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