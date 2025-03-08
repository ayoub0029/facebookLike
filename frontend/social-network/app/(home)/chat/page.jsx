'use client';
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { fetchApi } from "@/api/fetchApi";

import { M_PLUS_1 } from "next/font/google";

async function getData(url) {
  let response = await fetch(url).then((res) => res.json());
  return response;
}

let Profiles = [
  { id: 1, UserId: 1, fullName: "lahmami ayoub" },
  { id: 2, UserId: 2, fullName: "cheddad ahmed" },
  { id: 3, UserId: 3, fullName: "rrr rrr" },
  { id: 4, UserId: 4, fullName: "khir abdelouahab" },
  { id: 5, UserId: 5, fullName: "bouchikhi abdelilah" },
  { id: 6, UserId: 6, fullName: "kharkhach yassine" },
  { id: 7, UserId: 7, fullName: "elhabti mohammed" },
  { id: 8, UserId: 8, fullName: "serraf rachid" },
  { id: 9, GroupId: 2, fullName: "Group 1" },

]

export default function Chat() {
  const [counter, setCounter] = useState(5);
  const [msgType, setMsgType] = useState('');
  const [Receiver, setReceiver] = useState(0);
  const [messages, setMessages] = useState([
    /*{ id: 1, fullName: "elhmami ayoub", avatar: "./images/profile.jpeg", date: "22-02-2025", message: "kirak dayer" },
    { id: 2, fullName: "khir abdelouahab", avatar: "./images/profile.jpeg", date: "22-02-2025", message: "elhamdulilah" },
    { id: 3, fullName: "bochikhi abdelilah", avatar: "./images/profile.jpeg", date: "22-02-2025", message: "cv ?" },
    { id: 4, fullName: "cheddad ahmed", avatar: "./images/profile.jpeg", date: "22-02-2025", message: "hello world" },
  */])
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
      const data = JSON.parse(event.data)
      setMessage(data.message);
      const msg = data.message;
      const sender = data.sender_id;
      const date = new Date(data.timestamp).toString();
      let fullName = "";
      Profiles.forEach((elem) => {
        if (elem.id == sender) {
          fullName = elem.fullName;
          return;
        }
      })
      setMessages([...messages, { id: sender, fullName: fullName, avatar: "./images/profile.jpeg", date: date, message: msg }])
      console.log("message is ", data); // Display incoming message
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
        "Type": "privateChat",
        "Content": {
          Receiver_id: Receiver,
          message: document.getElementById('MessageText').value,
        }
      }
      ws.send(JSON.stringify(msg));
    }
  };

  let ArrayOfMessages = messages.map((item) => {
    return (
      <MessageSection key={item.id} profile={item} />
    )
  })
  function handleClick() {
    let msg = document.getElementById('MessageText');
    if (msg) {
      setMessages([...messages, { id: counter, fullName: "elhabti", avatar: "./images/profile.jpeg", date: "22-02-2025", message: msg.value }]);
      setCounter(counter + 1);
    }
  }
  async function profileClick(profile) {
    const msgType = MessageType(profile);
    setMsgType(msgType);
    const chatWith = (msgType == 'privateChat') ? profile.UserId : profile.GroupId
    setReceiver(chatWith);
    let response = await fetchApi(`chats/${GetDataSource(msgType)}=${chatWith}&page=0`);
    setMessages(response);
  }
  let ArrayOfProfiles = Profiles.map((item) => {
    /*let key = 0;
    if (MessageType(item) == 'privateChat') {
      key = item.UserId;
    }else{
      key = item.GroupId;
    }*/
    return (
      <Profile key={item.id} onProfileClick={() => profileClick(item)} profile={item} />
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
          {messages.length > 0 && <InputsSend onSendMessage={sendMessage}/>}
        </footer>
      </aside>
      <div className="rightSidebar">
        {ArrayOfProfiles}
      </div>
    </>
  )
}


function GetDataSource(state) {
  return (state == 'privateChat') ? 'private?receiver_id' : 'group?group_id';
}
function MessageType(profile) {
  if (profile.GroupId !== undefined) {
    return 'groupChat';
  } else {
    return 'privateChat'
  }
}

function Profile({ profile, onProfileClick }) {
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

function MessageSection({ profile }) {
  return (
    <section className={styles.MessageSection}>
      <div className={styles.Image}>

      </div>
      <div className={styles.MessageHeaderContainer}>
        <header className={styles.MessageHeader}>
          <h3>{profile.fullName}</h3>
          <span>{profile.date}</span>
        </header>
        <section>
          <Message content={profile.message} />
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



function InputsSend({onSendMessage}) {
  return (
    <>
      <input id="MessageText" className={styles.MessageText} type="text" placeholder="type your message..." />
      <button id={styles.ButtonSend} onClick={onSendMessage}>Send</button>
    </>
  );
};

