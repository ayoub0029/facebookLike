"use client";

import style from "../../styles/profile.module.css";
import { useState } from "react";
import { Modal, Alert } from "./popup.jsx";
import { UsersFollowers, UsersFollowing } from "./users_follow.jsx";
import FollowButton from "./follow-button.jsx";
import { fetchApi } from "@/api/fetchApi";
import Link from "next/link";

const typeData = {
  false: "follow",
  pending: "waiting",
  accept: "unfollow",
  private: true,
  public: false,
};

const fieldProfile = {
  about_me: "AboutMe",
  avatar: "Avatar",
  date_of_birth: "DOB",
  email: "Email",
  first_name: "First_Name",
  last_name: "Last_Name",
  nickname: "Nickname",
  profile_status: "ProfileStatus",
};

export default function ProfileComponent({ profile, setProfile, showToast }) {
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
    const isImageUpload = field === "avatar";
    const newValue =
      field === "profile_status"
        ? formData.get("radio")
        : formData.get("input");

    let body = isImageUpload
      ? formData
      : JSON.stringify({ Field: field, Value: newValue });

    const resp = await fetchApi("profiles/update", "POST", body, true);

    if (resp.hasOwnProperty("error")) {
      showToast("error", resp.error.Error || "Unknown error");
      return;
    }

    if (isImageUpload) {
      setProfile((prev) => ({
        ...prev,
        Avatar: resp,
      }));
    } else {
      let fi = fieldProfile[field];
      setProfile((prev) => ({
        ...prev,
        [fi]: newValue,
      }));
    }

    closeModal("editProfile");
  }

  return profile.ProfileStatus === "private" && !profile.isOwner ? (
    <div className={style["profiletHeader"]}>
      <div>
        <img
          src={
            profile.Avatar?.startsWith("http")
              ? profile.Avatar
              : profile.Avatar && profile.Avatar !== "undefined"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${profile.Avatar}`
              : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
          }
          alt={profile.Nickname}
        />
      </div>

      <span className={style["full_name"]}>
        {profile.First_Name} {profile.Last_Name}
      </span>
      <br></br>

      <FollowButton
        statusFollow={typeData[profile.Status]}
        profileType={typeData[profile.ProfileStatus]}
        setProfile={setProfile}
        userID={profile.Id}
        showToast={showToast}
      />

      <div className={style["about"]}>
        <span>Private acount</span>
      </div>
    </div>
  ) : (
    <div className={style["profiletHeader"]}>
      <div>
        <img
          src={
            profile.Avatar?.startsWith("http")
              ? profile.Avatar
              : profile.Avatar && profile.Avatar !== "undefined"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${profile.Avatar}`
              : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
          }
          alt={profile.Nickname}
        />
      </div>

      <span className={style["full_name"]}>
        {profile.First_Name} {profile.Last_Name}
      </span>
      <span className={style["nickname"]}>@{profile.Nickname}</span>
      <span className={style["date_brith"]}>
        {formateDOB(profile.DOB, "/")}
      </span>

      <div className={style["follow"]}>
        <div onClick={() => openModal("followers")}>
          <span className={style["follow_number"]}> {profile.Follower}</span>
          <span> Followers</span>
        </div>

        <div onClick={() => openModal("following")}>
          <span className={style["follow_number"]}> {profile.Follwoed}</span>
          <span> Following</span>
        </div>
      </div>

      {(!profile.isOwner && profile.Status === 'accept') && (
      <Link 
        className="message-link" 
        href={`/chat/${profile.Id}?fullname=${profile.First_Name} ${profile.Last_Name}`}
      >
        <i className="fa-solid fa-message"></i> Message
      </Link>
    )}

      {isShowEditeProfile(profile.isOwner, openModal)}
      {!profile.isOwner ? (
        <FollowButton
          statusFollow={typeData[profile.Status]}
          profileType={typeData[profile.ProfileStatus]}
          setProfile={setProfile}
          userID={profile.Id}
          showToast={showToast}
        />
      ) : (
        <></>
      )}

      <div className={style["about"]}>
        <span>About Me</span>
        <p>{profile.AboutMe}</p>
      </div>

      {/* Followers Modal */}
      <Modal
        isOpen={modals.followers}
        onClose={() => closeModal("followers")}
        title="Followers"
      >
        <UsersFollowers userID={profile.Id} showToast={showToast} />
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={modals.following}
        onClose={() => closeModal("following")}
        title="Following"
      >
        <UsersFollowing
          userID={profile.Id}
          route={"/profile"}
          showToast={showToast}
        />
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => closeModal("editProfile")}
        title="Edit Profile"
      >
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-pen"></i> First Name
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "first_name")}
          >
            <input
              className={style["update_input"]}
              defaultValue={profile.First_Name}
              name="input"
              type="text"
              placeholder="first name..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-pen"></i> Last Name
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "last_name")}
          >
            <input
              className={style["update_input"]}
              defaultValue={profile.Last_Name}
              name="input"
              type="text"
              placeholder="last name..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-pen"></i> Nickname
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "nickname")}
          >
            <input
              className={style["update_input"]}
              defaultValue={profile.Nickname}
              name="input"
              type="text"
              placeholder="nickname..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-lock"></i> password
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "password")}
          >
            <input
              className={style["update_input"]}
              name="input"
              type="password"
              placeholder="password..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-envelope"></i> Email
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "email")}
          >
            <input
              className={style["update_input"]}
              defaultValue={profile.Email}
              name="input"
              type="text"
              placeholder="gmail..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-calendar"></i> Date Of Birth
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "date_of_birth")}
          >
            <input
              className={style["update_input"]}
              defaultValue="2003-11-01"
              name="input"
              type="date"
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-circle-info"></i> About Me
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "about_me")}
          >
            <input
              className={style["update_input"]}
              maxLength="200"
              defaultValue={profile.AboutMe}
              name="input"
              type="text"
              placeholder="about me..."
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            <i className="fa-solid fa-image"></i> Image Profile
          </label>
          <form
            className={style["update_form"]}
            encType="multipart/form-data"
            onSubmit={(e) => UpdateInfo(e, "avatar")}
          >
            <input
              className={style["update_input"]}
              name="avatar"
              type="file"
              required
            />
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
        <div className={style["update_div"]}>
          <label className={style["title_input"]} htmlFor="first_name">
            {" "}
            Type Account
          </label>
          <form
            className={style["update_form"]}
            onSubmit={(e) => UpdateInfo(e, "profile_status")}
          >
            <div className={style["mydict"]}>
              <div>
                <label>
                  <input
                    type="radio"
                    name="radio"
                    value="public"
                    defaultChecked={
                      profile.ProfileStatus === "public" ? true : false
                    }
                  />
                  <span>public</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="radio"
                    value="private"
                    defaultChecked={
                      profile.ProfileStatus === "private" ? true : false
                    }
                  />
                  <span>private</span>
                </label>
              </div>
            </div>
            <button type="submit" className={style["update_button"]}>
              Confirm
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function isShowEditeProfile(isOwner, openModal) {
  if (isOwner)
    return <div onClick={() => openModal("editProfile")}>Edit profile</div>;
}

function formateDOB(date, char) {
  var d = new Date(date);
  return `${d.getFullYear()}  ${char}  ${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}  ${char}  ${String(d.getDate()).padStart(2, "0")}`;
}
