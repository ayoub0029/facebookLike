"use client"

import style from "./profile.module.css"
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { Modal, Alert } from "./popup.jsx"
import { UsersFollowers, UsersFollowing } from "./users_follow.jsx"
import { fetchApi } from "@/api/fetchApi"
import config from "../../constns.json"

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

  const router = useRouter();
  async function UpdateInfo(e, field) {
    e.preventDefault();
    const formData = new FormData(e.target);

    let data = formData.get("input");
    // console.log(data, field)

    const resp = await fetchApi("profiles/update", "POST", JSON.stringify({ Field: field, Value: data }), true)
    if (resp.hasOwnProperty("error")) {
      alert(`Error get profile: ${resp.error.Error || 'Unknown error'} Status: ${resp.status}`);
      return
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  return profile.ProfileStatus === 'private' && !profile.isOwner ? (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : config.defaultImage}
          alt={profile.Nickname} />
      </div>

      <span className={style["full_name"]}>{profile.First_Name} {profile.Last_Name}</span>
      <br></br>

      {typeBtnShowFollow(profile)}

      <div className={style["about"]}>
        <span>Private acount</span>
      </div>
    </div>

  ) : (
    <div className={style["profiletHeader"]}>
      <div >
        <img src={profile.Avatar ? profile.Avatar : config.defaultImage}
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
      {isShowEditeProfile(profile.isOwner, openModal)}
      {typeBtnShowFollow(profile)}

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

function typeBtnShowFollow(profile) {
  switch (profile.Status) {
    case "false":
      return (
        <div className={style["btn_follow"]}>
          <button onClick={() => Follow(profile.Id)}>follow</button>
        </div>)
    case "pending":
      return (
        <div className={style["btn_follow"]}>
          <button >pending</button>
        </div>)

    case "accept":
      return (
        <div className={style["btn_follow"]}>
          <button onClick={() => Unfollow(profile.Id)}>unfollow</button>
        </div>)
  }
}

async function Follow(userID) {
  let form = new FormData()
  form.append("followedid", userID)

  const resp = await fetchApi('profiles/follow', 'POST', form, true)
  if (resp.hasOwnProperty("error")) {
    alert(`Error: ${resp.error} Status: ${resp.status}`);
    return
  }
  console.log(resp);
}

async function Unfollow(userID) {
  let form = new FormData()
  form.append("followedid", userID)

  const resp = await fetchApi('profiles/unfollow', 'POST', form, true)
  if (resp.hasOwnProperty("error")) {
    alert(`Error: ${resp.error} Status: ${resp.status}`);
    return
  }
  console.log(resp);
}