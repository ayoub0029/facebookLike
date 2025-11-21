"use client";
import Link from "next/link";
import "/styles/globals.css";
import { fetchApi } from "/api/fetchApi";
import { useRouter } from "next/navigation";
import { useRef,useState } from "react";
import style from "../auth.module.css";
import ErrorPopup from "@/components/ErrorPopup";

export default function Loginform() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const router = useRouter();
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorContent, setErrorContent] = useState("");

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
      setErrorContent(error);
      setShowErrorPopup(true);
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
        <Link href={"/auth/register"}>don't have account register</Link>
      </p>
      <Link href={process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/githublogin"}>
        <button className={style.github_button}>
          log-in with git-hub <i className="fa-brands fa-github"></i>
        </button>
      </Link>
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        errorContent={errorContent}
      />
    </div>
  );
}
