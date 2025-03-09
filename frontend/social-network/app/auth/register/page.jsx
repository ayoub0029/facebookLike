"use client";
import "../auth.module.css";
import style from "../auth.module.css";
import Link from "next/link";
import { fetchApi } from "/api/fetchApi";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import ErrorPopup from "@/components/ErrorPopup";
import { useState } from "react";

export default function Registerform() {
  async function github() {
    try {
      const response = await fetchApi("auth/githublogin");
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      alert(error);
    }
  }

  const days = [];
  for (let day = 1; day < 32; day++) {
    days.push(day);
  }
  const years = [];
  for (let year = 2025; year >= 1920; year--) {
    years.push(year);
  }

  const emailRef = useRef();
  const passwordRef = useRef();
  const fistNameRef = useRef();
  const LastNameRef = useRef();
  const nickNameRef = useRef();
  const imgRef = useRef();
  const dayRef = useRef();
  const monthRef = useRef();
  const yearRef = useRef();
  const bioRef = useRef();
  const router = useRouter();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorContent, setErrorContent] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  const handleRegister = async (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const file = imgRef.current.files[0];
    const firstName = fistNameRef.current.value;
    const lastName = LastNameRef.current.value;
    const nickName = nickNameRef.current.value;
    const date =
      yearRef.current.value +
      "-" +
      monthRef.current.value.padStart(2, "0") +
      "-" +
      dayRef.current.value.padStart(2, "0");
    const bio = bioRef.current.value;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatar", file);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("nickname", nickName);
    formData.append("dateob", date);
    formData.append("aboutMe", bio);
    if (file) formData.append("profilePic", file);
    try {
      const result = await fetchApi("auth/signup", "POST", formData, true);

      if (result.error) {
        // throw new Error(result.error || 'Login failed');
        throw new Error(result.error);
      }
      router.push("/auth/login");
    } catch (error) {
      console.log(error);
      setErrorContent(error);
      setShowErrorPopup(true);
    }
  };

  return (
    <div className={style.login_form_container}>
      <form className={style.loginform}>
        <div className={style.avatar}>
          <div className={style.avatarContainer}>
            <div
              className={style.img}
              style={{
                backgroundImage: previewImage
                  ? `url('${previewImage}')`
                  : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="%23CCCCCC" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 12a6 6 0 1 1 12 0 6 6 0 0 1-12 0zm12 8c0-3.315-2.685-6-6-6s-6 2.685-6 6H4c0-4.42 3.58-8 8-8s8 3.58 8 8h-2z"/></svg>')`,
              }}
            ></div>
          </div>
          <div>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              className={style.none}
              ref={imgRef}
              onChange={handleImageChange}
            />
            <label htmlFor="avatar" className={style.choose}>
              Choose Avatar
            </label>
          </div>
        </div>
        <div className={`${style.splited_form_group} ${style.split2}`}>
          <input ref={fistNameRef} type="text" placeholder="first name*" />
          <input ref={LastNameRef} type="text" placeholder="last name*" />
        </div>

        <div>
          <label>Birthday*</label>
          <div className={style.form_group_select}>
            <select ref={dayRef} id="day" required>
              <option value="">Day</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select ref={monthRef} required>
              <option value="">Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select ref={yearRef} required>
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={style.form_group}>
          <input ref={emailRef} type="email" placeholder="Email*" />
        </div>

        <div className={style.form_group}>
          <input ref={nickNameRef} type="text" placeholder="nickname" />
        </div>

        <div className={style.form_group}>
          <input ref={passwordRef} type="password" placeholder="password*" />
        </div>

        <div className={style.form_group}>
          <input ref={bioRef} type="text" placeholder="bio" />
        </div>

        <input
          onClick={handleRegister}
          className={style.login_button}
          type="button"
          value="submit"
        />
        <ErrorPopup
          isOpen={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          errorContent={errorContent}
        />
      </form>
      <p className={style.redirect}>
        already have account <Link href={"/auth/login"}> log in</Link>
      </p>
      <Link href={process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/githublogin"}>
        <button className={style.github_button}>
          register with git-hub <i className="fa-brands fa-github"></i>
        </button>
      </Link>
    </div>
  );
}
