import styles from "./page.module.css";

export default function Chat() {
  return (
    <>
      <aside className={styles.ChatSection}>
        <header className={styles.HeaderChat}>
          <h1>hello</h1>
          <h2>there</h2>
          <h3>world</h3>
        </header>
        <section className={styles.ContentMessages}>
          <MessageSection fullName="khir abdelouahab" avatar="./images/profile.jpeg" date="22-02-2025" message="hello world" />
          <MessageSection fullName="ayoub hmami" avatar="./images/profile.jpeg" date="22-02-2025" message="kirak dayer" />
          <MessageSection fullName="bochikhi abdelilah" avatar="./images/profile.jpeg" date="22-02-2025" message="cv ?" />
          <MessageSection fullName="khir abdelouahab" avatar="./images/profile.jpeg" date="22-02-2025" message="el hamdelilah" />
        </section>
        <footer className={styles.Footer}>
          <input id={styles.MessageText} type="text" placeholder="type your message..." />
          <button id={styles.ButtonSend}>Send</button>
        </footer>
      </aside>
      <div className="rightSidebar">
      </div>
    </>
  )
}



function MessageSection({ fullName, date, message }) {
  return (
    <section className={styles.MessageSection}>
      <div className={styles.Image}>

      </div>
      <div className={styles.MessageHeaderContainer}>
        <header className={styles.MessageHeader}>
          <h3>{fullName}</h3>
          <span>{date}</span>
        </header>
        <section>
          <Message content={message} />
          <Message content="put your self text text text text etxe text text text textt texet etxt hehe zjzj zjzjz" />

        </section>
      </div>
    </section>
  )
}

function Message({ content }) {
  return (
    <p className={styles.MessageContent}>{content}</p>
  )
}