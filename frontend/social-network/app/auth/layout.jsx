"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct import for Next.js App Router
import "../../styles/globals.css";
import style from "./auth.module.css";
import { checkIfLoggedIn } from "@/api/isLoggedIn";
import Image from "next/image";

export default function AuthLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await checkIfLoggedIn();

      if (user && user.status !== 401 && user.id !== undefined) {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className={style.bady}>
      <div className={style.container}>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <Lmodir />
            {children}
          </>
        )}
      </div>
    </div>
  );
}

function Lmodir() {
  return (
    <div className={style.brand_section}>
      <Image
        style={{ maxWidth: "300px" }}
        width={200}
        height={100}
        src={"http://localhost:3000/images/logo.png"}
        alt="logo"
        unoptimized={true}
        layout="responsive" />
      <h2 className={style.brand_tag_line}>
        make it easy to communicate with the world
      </h2>
    </div>
  );
}
