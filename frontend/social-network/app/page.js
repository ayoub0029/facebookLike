import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

function Navigation() {
  return (
    <>
      <div className="logo">
        <a href="/">
          <Image
            width={200}
            height={100}
            src="/logo.png"
            alt="logo"
            layout="responsive" />
        </a>
      </div>
      <div className="nav">
        <Link href={"/"} className="menuItem secondary"><i className="fas fa-home"></i> <span>&nbsp;Home</span></Link>
        <Link href={"/profile"} className="menuItem secondary"><i className="fas fa-user"></i> <span>&nbsp;Profile</span></Link>
        <Link href={"/groups"} className="menuItem secondary"><i className="fa-solid fa-user-group"></i> <span>&nbsp;Groups</span></Link>
        <Link href={"/chats"} className="menuItem secondary"><i className="fas fa-envelope"></i> <span>&nbsp;Chats</span></Link>
        <Link href={"/notifications"} className="menuItem secondary"><i className="fas fa-bell"></i> <span>&nbsp;Notifications</span></Link>
        <Link href={"/logout"} className="menuItem danger"><i className="fa-solid fa-arrow-right-from-bracket"></i> <span>&nbsp;Sign out</span></Link>
      </div>
    </>
  );
}

function CreatePost() {
  return (
    <div className="newPost">
      <textarea placeholder="Write something here..."></textarea>
      <div className="imgPrivacyPost">
        <label htmlFor="postImage" className="imageUp"><i className="fa-regular fa-image"></i> Image/GIF</label>
        <input type="file" id="postImage" className="imageUpload" accept="image/*,image/gif" />
        <select id="privacy" name="privacy">
          <option value="public">Public</option>
          <option value="almostPrivate">Almost Private (followers only)</option>
          <option value="private">Private (selected followers)</option>
        </select>
      </div>
      <button className="btn btnGreen">Post</button>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <button className="rightMenuToggle"><i className="fas fa-bars"></i></button>
      <div className="container">
        <div className="leftSidebar">
          <Navigation />
        </div>

        <aside className="feed">
          <CreatePost />
        </aside>

        <div className="rightSidebar">
          <div className="postHeader">
          </div>
          <div className="directMessages">
            <h3>Friends</h3>
          </div>

          <div className="groupMessages">
            <h3>Groups</h3>
          </div>
        </div>
      </div>
    </>
  )
}
