"use client"
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { fetchApi } from "@/api/fetchApi";
import { clearUserState } from "@/api/isLoggedIn";

export function Navigation() {
  const router = useRouter();

  async function logout() {
    try {
      let response = await fetchApi('auth/logout', 'POST', {}, true)
      if (response.error) {
        throw new Error(response.error || 'Logout failed');
      }
      clearUserState()
      router.push("/auth/login")
    } catch (error) {
      router.push("/auth/login")
    }
  }

  return (
    <>
      <div className="logo">
        <a href="/">
          <Image
            style={{ maxWidth: "220px" }}
            width={200}
            height={100}
            src={"http://localhost:3000/images/logo.png"}
            alt="logo"
            unoptimized={true}
            layout="responsive" />
        </a>
      </div>
      <div className="nav">
        <Link href={"/"} className="menuItem secondary"><i className="fas fa-home"></i> <span>&nbsp;Home</span></Link>
        <Link href={"/profile"} className="menuItem secondary"><i className="fas fa-user"></i> <span>&nbsp;Profile</span></Link>
        <Link href={"/groups"} className="menuItem secondary"><i className="fa-solid fa-user-group"></i> <span>&nbsp;Groups</span></Link>
        <Link href={"/chat"} className="menuItem secondary"><i className="fas fa-envelope"></i> <span>&nbsp;Chats</span></Link>
        <Link href={"/notifications"} className="menuItem secondary"><i className="fas fa-bell"></i> <span>&nbsp;Notifications</span></Link>
        <div onClick={logout} className="menuItem danger"><i className="fa-solid fa-arrow-right-from-bracket"></i> <span>&nbsp;Sign out</span></div>
      </div>
    </>
  );
}