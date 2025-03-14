"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { Navigation } from "@/components/navbar";
import { checkIfLoggedIn } from "@/api/isLoggedIn";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WebSocketProvider } from "@/hooks/websocket-context.jsx";

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
      const user = await checkIfLoggedIn();

      if (!user || user.id === null || user.state === 401 || user.id === undefined) {
        router.push("/auth/login");
      } else {
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
          <>
            <div className="container">
              <div className="leftSidebar">
                <Navigation />
              </div>
              <WebSocketProvider >{children}</WebSocketProvider>
              {/* {children} */}
            </div>
          </>
        )}
      </body>
    </html>
  );
}