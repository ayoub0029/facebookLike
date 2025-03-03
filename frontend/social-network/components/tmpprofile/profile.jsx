import style from "./profile.module.css"
import { useState } from "react"
import Modal from "./popup.jsx"

const UserItem = ({ avatar, name, username, onActionClick, actionText }) => (
  <div className="user-item">
    <img src={avatar || "http://localhost:8080/public/test.jpg"} className="smallImg" alt={name} />
    <div className="user-info">
      <p className="user-name">{name}</p>
      <p className="user-username">@{username}</p>
    </div>
    {actionText && (
      <button className="user-action-btn" onClick={onActionClick}>
        {actionText}
      </button>
    )}
  </div>
);

export default function ProfileComponent({ profile }) {
  const [modals, setModals] = useState({
    followers: false,
    following: false,
    editProfile: false,
    settings: false,
    shareProfile: false
  });

  const openModal = (modalName) => {
    setModals({ ...modals, [modalName]: true });
  };

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false });
  };

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
        <div onClick={() => openModal('followers')}>
          <span className={style["follow_number"]}> {profile.Follower}</span>
          <span> Followers</span>
        </div>

        <div onClick={() => openModal('following')}>
          <span className={style["follow_number"]}> {profile.Follwoed}</span>
          <span> Following</span>
        </div>
      </div>

      {isShowBtnFollow(profile)}

      <div className={style["about"]}>
        <span>About Me</span>
        <p>{profile.AboutMe}</p>
      </div>

      {/* Followers Modal */}
      <Modal
        isOpen={modals.followers}
        onClose={() => closeModal('followers')}
        title="Followers"
      >
        <div className="user-list">

        </div>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={modals.following}
        onClose={() => closeModal('following')}
        title="Following"
      >
        <div className="user-list">

        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => closeModal('editProfile')}
        title="Edit Profile"
      >
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={modals.settings}
        onClose={() => closeModal('settings')}
        title="Profile Settings"
      >
        <div className="settings-list">
          <div className="setting-item">
            <label>Profile Visibility</label>
            <select defaultValue={profile.ProfileStatus}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Push Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="form-buttons">
            <button onClick={() => closeModal('settings')}>Cancel</button>
            <button>Save Settings</button>
          </div>
        </div>
      </Modal>

      {/* Share Profile Modal */}
      <Modal
        isOpen={modals.shareProfile}
        onClose={() => closeModal('shareProfile')}
        title="Share Profile"
      >
        <div className="share-options">
          <button className="share-btn">
            <span className="share-icon">📱</span>
            Copy Link
          </button>
          <button className="share-btn">
            <span className="share-icon">✉️</span>
            Email
          </button>
          <button className="share-btn">
            <span className="share-icon">📘</span>
            Facebook
          </button>
          <button className="share-btn">
            <span className="share-icon">🐦</span>
            Twitter
          </button>
          <button className="share-btn">
            <span className="share-icon">💼</span>
            LinkedIn
          </button>
        </div>
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