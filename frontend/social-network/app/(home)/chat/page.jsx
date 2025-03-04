'use client';
import { useState } from "react";
import styles from "./page.module.css";
import { M_PLUS_1 } from "next/font/google";

async function getData(url){
    let response = await fetch(url).then((res) => res.json());
    return response;
}

let Profiles = [
  {id: 1 , fullName: "khir abdelouahab"},
  {id: 2 , fullName: "bouchikhi abdelilah"},
  {id: 3 , fullName: "lahmami ayoub"},
  {id: 4 , fullName: "kharkhach yassine"},
  {id: 5 , fullName: "serraf rachid"},
]

export default function Chat() {
  const [counter,setCounter] = useState(5);
  const [messages,setMessages] = useState([
    {id:1, fullName: "khir abdelouahab",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"hello world"},
    {id:2,fullName: "elhmami ayoub",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"kirak dayer"},
    {id:3,fullName: "bochikhi abdelilah",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"cv ?"},
    {id:4,fullName: "khir abdelouahab",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"elhamdulilah"},
  ])
  /*let response = getData('http://localhost:8080/chats/private?receiver_id=2&page=0');
  console.log("messages : ",response);*/
  let ArrayOfMessages = messages.map((item)=>{
    return (
      <MessageSection key={item.id} fullName={item.fullName} avatar={item.avatar} date={item.date} message={item.message} />
    )
  })
  function handleClick() {
    let msg = document.getElementById('MessageText');
    if (msg) {
      setMessages([...messages,{id:counter,fullName: "elhabti",avatar:"./images/profile.jpeg", date:"22-02-2025", message:msg.value}]);
      setCounter(counter + 1);
    }
  }
  function profileClick(profile) {
    console.log(profile.fullName , " has clicked!, id : ",profile.id);
    setMessages([{id:profile.id, fullName: profile.fullName,avatar:"./images/profile.jpeg", date:"22-02-2025", message:"wsh ?"},
      {id:2,fullName: "elhmami ayoub",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"kirak dayer"},])
  }
  let ArrayOfProfiles = Profiles.map((item)=>{
    return (
      <Profile key={item.id} onProfileClick={()=> profileClick(item)} profile={item} />
    )
  })
  return (
    <>
      <aside className={styles.ChatSection}>
        <header className={styles.HeaderChat}>
          <h1>hello</h1>
          <h2>there</h2>
          <h3>world</h3>
        </header>
        <section className={styles.ContentMessages}>
          {ArrayOfMessages}
        </section>
        <footer className={styles.Footer}>
          <input id="MessageText" className={styles.MessageText} type="text" placeholder="type your message..." />
          <button id={styles.ButtonSend} onClick={handleClick}>Send</button>
        </footer>
      </aside>
      <div className="rightSidebar">
        {ArrayOfProfiles}
      </div>
    </>
  )
}



function Profile({profile,onProfileClick}) {
    return (
      <div onClick={onProfileClick} className={styles.ProfileContainer}>
        <div className={styles.Image}>

        </div>
        <div className={styles.MessageHeaderContainer}>
          <h3>{profile.fullName}</h3>
        </div>
      </div>
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

