"use client"
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { fetchApi } from "@/api/fetchApi";

export function Navigation() {
  const router = useRouter();

  async function logout() {
    try {
      let response = await fetchApi('auth/logout', 'POST', {}, true)
      if (response.error) {
        throw new Error(response.error || 'Logout failed');
      }
      router.push("/auth/login")
    } catch (error) {
      console.log(error)
      router.push("/auth/login")
    }
  }

  return (
    <>
      <div className="logo">
        <a href="/">
          <Image
            style={{ maxWidth: "300px" }}
            width={200}
            height={100}
            src={process.env.NEXT_PUBLIC_API_BASE_URL + "/public/logo.png"}
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