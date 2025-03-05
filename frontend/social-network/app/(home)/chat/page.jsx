'use client';
import {useEffect, useState } from "react";
import styles from "./page.module.css";
import { fetchApi } from "@/api/fetchApi";

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
    {id:1,fullName: "elhmami ayoub",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"kirak dayer"},
    {id:2, fullName: "ahmed ahmed",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"hello world"},
    {id:3,fullName: "bochikhi abdelilah",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"cv ?"},
    {id:4,fullName: "khir abdelouahab",avatar:"./images/profile.jpeg", date:"22-02-2025", message:"elhamdulilah"},
  ])
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState(null);
   // Establish WebSocket connection when the component mounts
   useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws'); // Replace with your WebSocket server URL

    // Set the WebSocket instance in state
    setWs(socket);

    // WebSocket open event
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    // WebSocket message event
    socket.onmessage = (event) => {
      setMessage(event.data); // Display incoming message
    };

    // WebSocket error event
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // WebSocket close event
    socket.onclose = () => {
      console.log('WebSocket closed');
      setConnected(false);
    };

    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  const sendMessage = () => {
    if (ws && connected) {
      let msg = {
        "Type" : "privateChat",
        "Content" : {
          reciever : 3,
          message : "hello mayni",
        }
      }
      ws.send(JSON.stringify(msg));
    }
  };

  // async function getData() {
    //   let response = await fetchApi('chats/private?receiver_id=2&page=0');
    //   console.log("messages : ",response);
    //   return response;
    // }
    // await getData();
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
          <button id={styles.ButtonSend} onClick={sendMessage}>Send</button>
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



function WebSocketComponent() {
  

 

  // Send message to server
  
  return (
    <div>
      <h2>WebSocket Example</h2>
      <div>
        <p>Connected: {connected ? 'Yes' : 'No'}</p>
        <button onClick={sendMessage} disabled={!connected}>
          Send Message
        </button>
      </div>
      <div>
        <h3>Received Message:</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};

