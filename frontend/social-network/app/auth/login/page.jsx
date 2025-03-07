"use client";
import Link from "next/link";
import "/styles/globals.css";
import { fetchApi } from "/api/fetchApi";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import style from "../auth.module.css";

export default function Loginform() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    let email = emailRef.current.value;
    let password = passwordRef.current.value;
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const result = await fetchApi("auth/login", "POST", formData, true);

      if (result.error) {
        throw new Error(result.error.message || "Login failed");
      }

      router.push("/");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <div className={style.login_form_container}>
      <form className={style.loginform}>
        <h1 className={style.login}>Log in</h1>
        <div className={style.form_group}>
          <input type="text" ref={emailRef} placeholder="Email"></input>
        </div>
        <div className={style.form_group}>
          <input
            type="password"
            ref={passwordRef}
            placeholder="Password"
          ></input>
        </div>
        <button
          type="submit"
          onClick={handleLogin}
          className={style.login_button}
        >
          Log In
        </button>
      </form>
      <p className={style.redirect}>
        don't have account <Link href={"/auth/register"}> register</Link>
      </p>
    </div>
  );
}