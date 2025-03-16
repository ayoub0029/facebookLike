"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { Navigation } from "@/components/navbar";
import { checkIfLoggedIn } from "@/api/isLoggedIn";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WebSocketProvider } from "@/hooks/websocket-context.jsx";
import { ToastProvider } from "@/hooks/toast-context.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function HomeLayout({ children }) {
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
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
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
            <ToastProvider>
              <WebSocketProvider>{children}</WebSocketProvider>
            </ToastProvider>
          </div>
        </>
      )}
    </div>
  );
}