"use client"  
import "../auth.css"
import "@/styles/globals.css"
import Link from "next/link";
// import { useRouter} from 'next/router';
import { fetchApi } from "/api/fetchApi";
import { useRef } from 'react';
export default function Registerform() {
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
  
    const handleRegister = async (e) => {
      e.preventDefault();


      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const file = imgRef.current.files[0];
      const firstName = fistNameRef.current.value;
      const lastName = LastNameRef.current.value;
      const nickName = nickNameRef.current.value;
      const date = yearRef.current.value +"-"+monthRef.current.value.padStart(2, "0") + "-" + dayRef.current.value.padStart(2, "0");
      const bio = bioRef.current.value;

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('avatar', file);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('nickname', nickName);
      formData.append('dateob', date);
      formData.append('aboutMe', bio);
      if (file) formData.append('profilePic', file);
      try {
        const result = await fetchApi('auth/signup', 'POST', formData,true);

        if (result.error) {
          throw new Error(result.error || 'Login failed');
        }
        alert("niceer" + nickName)
      } catch (error) {
        alert(error)
      }
    };


  return (
    <div className="form">
      <div className="split">
        <input ref={fistNameRef} type="text" placeholder="first name" />
        <input ref={LastNameRef} type="text" placeholder="last name" />
      </div>

      <div>
        <label>Birthday</label>
        <div className="split">
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
      <input ref={emailRef} type="email" placeholder="Email" />
      <input ref={nickNameRef} type="text" placeholder="nickname" />
      <input ref={passwordRef} type="password" placeholder="password" />
      <label htmlFor="postImage" className="imageUp">
        <i className="fa-regular fa-image"></i> choose avatar Image/GIF
      </label>
      <input
        type="file"
        id="postImage"
        className="imageUpload"
        accept="image/*,image/gif"
        ref={imgRef}
      />
      <input ref={bioRef} type="text" placeholder="bio" />
      <p className="redirect">
        already have account <Link href={"/auth/login"}> register</Link>
      </p>
      <input onClick={handleRegister} type="button" value="submit" />
    </div>
  );
}