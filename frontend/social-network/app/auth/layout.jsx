"use client";
import "../../styles/globals.css";
import style from "./auth.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkIfLoggedIn } from "@/api/isLoggedIn";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await checkIfLoggedIn();

        if (
          user &&
          user.id !== null &&
          user.state !== 401 &&
          user.id !== undefined
        ) {
          router.push("/");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={style.bady}>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className={style.container}>
            <Lmodir />
            {children}
          </div>
        )}
      </body>
    </html>
  );
}

function Lmodir() {
  return (
    <div className={style.brand_section}>
      <h1 className={style.brand_logo}>lmodir</h1>
      <h2 className={style.brand_tag_line}>
        make it easy to communicate with the world
      </h2>
    </div>
  );
}