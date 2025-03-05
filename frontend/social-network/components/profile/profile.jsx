"use client"

import style from "./profile.module.css"
import { useState } from "react"
import { Modal, Alert } from "./popup.jsx"
import { UsersFollowers, UsersFollowing } from "./users.jsx"
import { fetchApi } from "@/api/fetchApi"

export default function ProfileComponent({ profile }) {
  const [modals, setModals] = useState({
    followers: false,
    following: false,
    editProfile: false,
  });

  const openModal = (modalName) => {
    setModals({ ...modals, [modalName]: true });
  };

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false });
  };
  console.log(profile);

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
      <div onClick={() => openModal('editProfile')}>
        Edite profile
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
          <UsersFollowers userID={profile.Id} />
        </div>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={modals.following}
        onClose={() => closeModal('following')}
        title="Following"
      >
        <div className="user-list">
          <UsersFollowing userID={profile.Id} />
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => closeModal('editProfile')}
        title="Edit Profile"
      >

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "first_name")} >
          <input className={style["update_input"]} name="input" type="text" placeholder="first name..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "last_name")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="last name..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "nickname")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="nickname..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "password")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="password..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "email")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="gmail..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "date_of_birth")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="date of birth..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "about_me")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="about me..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "avatar")}>
          <input className={style["update_input"]} name="input" type="file" placeholder="avatar..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "profile_status")}>
          <input type="radio" id="public" name="input" value="public" />
          <label htmlFor="public">public</label>
          <input type="radio" id="private" name="input" value="private" />
          <label htmlFor="private">private</label>
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>
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

function UpdateInfo(e, field) {
  e.preventDefault();
  const formData = new FormData(e.target);

  let data = formData.get("input");
  console.log(data, field)
  async function putData() {
    const resp = await fetchApi("profiles/update", "POST", JSON.stringify({ field: field, data: data }), true)
    console.log(resp);
  }
  putData()
}