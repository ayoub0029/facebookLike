"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { Navigation } from "@/components/navbar";
import { checkIfLoggedIn } from "@/api/isLoggedIn";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await checkIfLoggedIn();
      setIsLoggedIn(user);
      console.log("User:", user);
      console.log(isLoggedIn); // mazal khedam hna

    };
    fetchUser();
  }, []);
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <button className="rightMenuToggle"><i className="fas fa-bars"></i></button>
        <div className="container">
          <div className="leftSidebar">
            <Navigation />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
