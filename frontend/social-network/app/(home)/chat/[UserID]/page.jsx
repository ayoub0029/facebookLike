"use client"

import { useState, useEffect, useRef } from "react"
import { useWebSocket } from "@/hooks/websocket-context.jsx"
import styles from "./chat.module.css"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const UserID = params.UserID

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef(null)
  const { isConnected, sendMessage, setMessageHandler } = useWebSocket()
  const [hamberMenu, setHamberMenu] = useState(false);


  // Handle incoming messages
  useEffect(() => {
    setMessageHandler((data) => {
      console.log("Received data:", data)

      try {
        const parsedData = JSON.parse(data)

        if (parsedData.sender_id === Number.parseInt(UserID)) {
          console.log("Matched message:", parsedData)
          setMessages((prev) => [...prev, parsedData])
        }
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    })

    return () => {
      setMessageHandler(null)
    }
  }, [setMessageHandler, UserID])

  useEffect(() => {
    const chatContent = document.querySelector(`.${styles.chatContent}`)
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight
    }
  }, [messages])

  function handleSendMessage(e) {
    e.preventDefault()

    if (!inputMessage.trim() || !isConnected) return

    const messageObj = {
      type: "privateChat",
      content: {
        receiver_id: Number.parseInt(UserID),
        message: inputMessage,
        timestamp: new Date().toISOString(),
      },
    }

    sendMessage(JSON.stringify(messageObj))


    const localMessageObj = {
      receiver_id: UserID,
      message: inputMessage,
      timestamp: new Date().toISOString(),
      _isOutgoing: true,
    }

    setMessages((prev) => [...prev, localMessageObj])
    setInputMessage("")
  }

  function formatTime(timestamp) {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function isCurrentUser(msg) {
    if (msg._isOutgoing) return true
    return msg.sender_id === window.userState.id
  }
  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  return (<>
    <button onClick={toggleMenu} className="rightMenuToggle">
      <i className="fas fa-bars"></i>
    </button>

    <aside className="feed" style={{ backgroundColor: '#f5f5f5' }} >
      <div className={styles.chatContainer}>
        <div className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <h2 className={styles.chatTitle}>Chat with {UserID}</h2>
            <span className={isConnected ? styles.statusConnected : styles.statusDisconnected}>
            {isConnected ? "you Connected" : "you Disconnected"}
          </span>
          </div>

          <div className={styles.chatContent}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageRow} ${isCurrentUser(msg) ? styles.outgoing : styles.incoming}`}
              >
                <div className={isCurrentUser(msg) ? styles.outgoingMessage : styles.incomingMessage}>
                  {!isCurrentUser(msg) && <div className={styles.messageSender}>{msg.sender_id}</div>}
                  <div className={styles.messageContent}>{msg.message}</div>
                  <div className={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatFooter}>
            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <input
                type="text"
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!isConnected}
                className={styles.messageInput}
              />
              <button type="submit" disabled={!isConnected || !inputMessage.trim()} className={styles.sendButton}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>

    <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>

    </div>
  </>)
}

