import Image from "next/image";
import Link from "next/link";

export function Navigation() {
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
            layout="responsive" />
        </a>
      </div>
      <div className="nav">
        <Link href={"/"} className="menuItem secondary"><i className="fas fa-home"></i> <span>&nbsp;Home</span></Link>
        <Link href={"/profile"} className="menuItem secondary"><i className="fas fa-user"></i> <span>&nbsp;Profile</span></Link>
        <Link href={"/groups"} className="menuItem secondary"><i className="fa-solid fa-user-group"></i> <span>&nbsp;Groups</span></Link>
        <Link href={"/chat"} className="menuItem secondary"><i className="fas fa-envelope"></i> <span>&nbsp;Chats</span></Link>
        <Link href={"/notifications"} className="menuItem secondary"><i className="fas fa-bell"></i> <span>&nbsp;Notifications</span></Link>
        <Link href={"/logout"} className="menuItem danger"><i className="fa-solid fa-arrow-right-from-bracket"></i> <span>&nbsp;Sign out</span></Link>
      </div>
    </>
  );
}