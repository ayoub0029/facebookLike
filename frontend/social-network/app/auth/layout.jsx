"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import "./auth.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkIfLoggedIn } from "@/api/isLoggedIn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="container">
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
    <div className="lmodir">
      <h1>lmodir</h1>
      <p>
        Make it easy to communicate
        <br />
        with the world
      </p>
    </div>
  );
}
