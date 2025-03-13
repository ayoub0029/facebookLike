'use client';
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { fetchApi } from "@/api/fetchApi";
import { useParams } from "next/navigation";

async function getData(messageType,chatwith,page) {
  /*let applications = await fetchApi('group/applications?page=0');
  console.log("applications : ",applications);*/
  let response = await fetchApi(`chats/${GetDataSource(messageType)}=${chatwith}&page=${page}`);
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

  const UserID = useParams();
  const [page, setPage] = useState(0);
  const [msgType, setMsgType] = useState('');
  const [Receiver, setReceiver] = useState(0);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState(null);
  // Establish WebSock\et connection when the component mounts
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws'); // Replace with your WebSocket server URL
    setWs(socket);
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //console.log("data is : ",data);
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
      setReceiver(sender);
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderid: sender, messageid: 20, fullname: fullName, avatar: "./images/profile.jpeg", createdDate: date, message: msg }
      ]);
    };
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
    socket.onclose = () => {
      console.log('WebSocket closed');
      setConnected(false);
    };
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
const sendMessage = () => {
  if (ws && connected) {
    let msg = {
      "Type": msgType,
      "Content": {
        Receiver_id: Receiver,
        message: document.getElementById('MessageText').value,
      }
    }
    ws.send(JSON.stringify(msg));
  }
};

function profileClick(profile) {
  let msgtype = MessageType(profile);
  let chatwith = (msgtype == 'privateChat') ? profile.UserId : profile.GroupId;
  setMsgType(msgtype);
  setReceiver(chatwith);
  setPage(0);
}

  useEffect(()=>{
    async function fetchData() {
      try {
        let response = await getData(msgType, Receiver, page);
        if (!Array.isArray(response)) {
          response = [];
        }
        setMessages((prevMessages = []) => {
          return prevMessages.length > 0 ? [...response,...prevMessages] : response;
        }); 
      } catch (error) {
        console.error("Error fetching messages:", error);
      }  
    }
    fetchData();
  },[page,Receiver]);
  let ArrayOfMessages = [];
  if (messages !== null && messages.length > 0 ) {
      ArrayOfMessages = messages.map((item) => {
        return (
          <MessageSection key={item.messageid} profile={item} />
        )
      })
  }
  
  let ArrayOfProfiles = Profiles.map((item) => {
    return (
      <Profile key={item.id} onProfileClick={() => profileClick(item)} profile={item} />
    )
  })

  const  scrollHandler = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target; 
    if (scrollTop == 0) {
      setPage(page + 15); 
    }
  }
  return (
    <>
      <aside className={styles.ChatSection}>
        <header className={styles.HeaderChat}>
          <h1>hello</h1>
          <h2>there</h2>
          <h3>world</h3>
        </header>
        <section  onScroll={scrollHandler} className={styles.ContentMessages}>
          {ArrayOfMessages}
        </section>
        <footer className={styles.Footer}>
          {Receiver != 0 && <InputsSend onSendMessage={sendMessage}/>}
        </footer>
      </aside>
      <div className="rightSidebar">
        {ArrayOfProfiles}
      </div>
    </>
  )
}

function getDataInfo(profile) {
  return {msgtype : MessageType(profile),chatwith : (msgType == 'privateChat') ? profile.UserId : profile.GroupId } 
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
          <h3>{profile.fullname}</h3>
          <span>{new Date(profile.createdDate).toDateString()}</span>
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

