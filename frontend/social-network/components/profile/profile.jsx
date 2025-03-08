"use client"

import style from "./profile.module.css"
import { useState } from "react"
import { Modal, Alert } from "./popup.jsx"
import { UsersFollowers, UsersFollowing } from "./users_follow.jsx"
import FollowButton from "./follow-button.jsx"
import { fetchApi } from "@/api/fetchApi"
import config from "../../constns.json"

const typeData = {
  'false': "follow",
  'pending': "waiting",
  'accept': "unfollow",
  'private': true,
  'public': false
}
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

  async function UpdateInfo(e, field) {
    e.preventDefault();
    const formData = new FormData(e.target);

    let data = formData.get("input");

    const resp = await fetchApi("profiles/update", "POST", JSON.stringify({ Field: field, Value: data }), true)
    if (resp.hasOwnProperty("error")) {
      alert(`Error get profile: ${resp.error.Error || 'Unknown error'} Status: ${resp.status}`);
      return
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
  console.log(profile);

  return profile.ProfileStatus === 'private' && !profile.isOwner ? (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : config.defaultImage}
          alt={profile.Nickname}
          onError={(eve) => eve.target.srcset = config.defaultImage} />
      </div>

      <span className={style["full_name"]}>{profile.First_Name} {profile.Last_Name}</span>
      <br></br>

      <FollowButton statusFollow={typeData[profile.Status]} profileType={typeData[profile.ProfileStatus]} userID={profile.Id} />

      <div className={style["about"]}>
        <span>Private acount</span>
      </div>
    </div>

  ) : (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : config.defaultImage}
          alt={profile.Nickname}
          onError={(eve) => eve.target.srcset = config.defaultImage} />
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
      {isShowEditeProfile(profile.isOwner, openModal)}
      {!profile.isOwner ?
        <FollowButton statusFollow={typeData[profile.Status]} profileType={typeData[profile.ProfileStatus]} userID={profile.Id} />
        : <></>}

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
        <UsersFollowers userID={profile.Id} />
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={modals.following}
        onClose={() => closeModal('following')}
        title="Following"
      >
        <UsersFollowing userID={profile.Id} />
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => closeModal('editProfile')}
        title="Edit Profile"
      >

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "first_name")} >
          <input className={style["update_input"]} value={profile.First_Name} name="input" type="text" placeholder="first name..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "last_name")}>
          <input className={style["update_input"]} value={profile.Last_Name} name="input" type="text" placeholder="last name..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "nickname")}>
          <input className={style["update_input"]} value={profile.Nickname} name="input" type="text" placeholder="nickname..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "password")}>
          <input className={style["update_input"]} name="input" type="text" placeholder="password..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "email")}>
          <input className={style["update_input"]} value={profile.Email} name="input" type="text" placeholder="gmail..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "date_of_birth")}>
          <input className={style["update_input"]}  name="input" type="date" placeholder="date of birth..." required />
          <button type="submit" className={style["update_button confirm"]}>Confirm</button>
        </form>

        <form className={style["update_form"]} onSubmit={(e) => UpdateInfo(e, "about_me")}>
          <input className={style["update_input"]} value={profile.AboutMe} name="input" type="text" placeholder="about me..." required />
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
function isShowEditeProfile(isOwner, openModal) {
  if (isOwner)
    return <div onClick={() => openModal('editProfile')}>
      Edite profile
    </div>
}

function formateDOB(date) {
  var d = new Date(date)
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`
}
