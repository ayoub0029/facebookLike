import "../../styles/globals.css";
import style from "./auth.module.css";

export default function AuthLayout({ children }) {
  return (
    <div className={style.bady}>
      <div className={style.container}>
        <Lmodir/>
        {children}
      </div>
    </div>
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