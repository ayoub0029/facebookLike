import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import style from "./auth.module.css"

export default function RootLayout({ children }) {
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
        <div className={style.container}>
          <Lmodir/>
          {children}
        </div>
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
