"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "@/hooks/websocket-context.jsx";
import styles from "../chat.module.css";
import { useParams } from "next/navigation";
import { fetchApi } from "@/api/fetchApi";
import { useToast } from "@/hooks/toast-context";
import { UsersFollowing } from "@/components/profile/users_follow";
import NotFound404 from "@/components/404";
import { User } from "@/components/profile/users_follow";

export default function ChatPage() {
  const params = useParams();
  const UserID = params.UserID;

  const [profile, setProfile] = useState()
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const containerRef = useRef();
  const { isConnected, sendMessage, setMessageHandler } = useWebSocket();
  const [hamberMenu, setHamberMenu] = useState(false);
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [positionScroll, setPositionScroll] = useState(1200);

  useEffect(() => {
    async function fetchProfile() {
      const response = await fetchApi(`profiles?user_id=${UserID}`, "GET");
      if (response.hasOwnProperty("error")) {
        if (response.error.Error) {
          setProfile(404);
          return;
        }
        showToast("error", response.error.Error || "Unknown error")
      } else {
        setProfile(response);
      }
    }
    fetchProfile();
  }, [UserID]);

  // ayoub ---
  const [scrollBackId, setScrollBackId] = useState(0);
  const scrollToMessage = useCallback((messageId) => {
    if (!messageId) return;

    setTimeout(() => {
      const element = document.getElementById("msg" + messageId);
      if (element) {
        element.scrollIntoView({ behavior: "auto" });
      }
    }, 0);
  }, []);

  const fetchMoreData = useCallback(
    async (currPage) => {
      if (isFetching.current || !hasMore) return;
      isFetching.current = true;
      setLoading(true);

      try {
        const data = await fetchApi(
          `/chats/private?receiver_id=${UserID}&page=${currPage}`,
          "GET"
        );
        if (!data || !Array.isArray(data)) {
          setHasMore(false);
          return;
        }

        let lastMessageId = 0;
        let dataParse = data.map((itm, index) => {
          // ayoub ---
          if (index === data.length - 3) lastMessageId = itm.messageid;

          return {
            sender_id: itm.senderid,
            message: itm.message,
            timestamp: itm.createdDate,
            messageid: itm.messageid,
            fullname: itm.fullname,
          };
        });

        setMessages((prev) => [...dataParse, ...prev]);

        setScrollBackId(lastMessageId);

        if (data.length < 10) {
          setHasMore(false);
        }
      } catch (err) {
        showToast("error", "failed to get messages");
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [UserID, setScrollBackId]
  );

  useEffect(() => {
    fetchMoreData(page);
  }, [page, fetchMoreData]);

  // handel scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop === 0 && scrollHeight !== clientHeight) {
        setPage((prev) => prev + 10);
      }
    };
    const chatContainer = containerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, scrollBackId]);

  // ayoub ---
  useEffect(() => {
    if (scrollBackId) {
      scrollToMessage(scrollBackId);
    }
  }, [scrollBackId, scrollToMessage]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = positionScroll;
    }
  }, [messages]);

  // Handle incoming messages
  useEffect(() => {
    setMessageHandler((data) => {
      try {

        if (data.sender_id === Number.parseInt(UserID)) {
          setMessages((prev) => [...prev, data]);
          setPositionScroll(containerRef.current.scrollHeight);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    return () => {
      setMessageHandler(null);
    };
  }, [setMessageHandler, UserID]);

  // handel send message
  function handleSendMessage(e) {
    e.preventDefault();

    if (!inputMessage.trim() || !isConnected) return;

    const messageObj = {
      type: "privateChat",
      content: {
        receiver_id: Number.parseInt(UserID),
        message: inputMessage,
        timestamp: new Date(),
      },
    };

    sendMessage(JSON.stringify(messageObj));

    const localMessageObj = {
      receiver_id: UserID,
      message: inputMessage,
      timestamp: new Date(),
      _isOutgoing: true,
    };

    setMessages((prev) => [...prev, localMessageObj]);
    setInputMessage("");
    setPositionScroll(containerRef.current.scrollHeight);
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    return `${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} ${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  }

  function isCurrentUser(msg) {
    if (msg._isOutgoing) return true;
    return msg.sender_id === window.userState.id;
  }
  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '✨', '😎', '🤔', '😢'];
  if (!profile) return <div> Loading... </div>;
  if (profile === 404) return <NotFound404 />
  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed" style={{ backgroundColor: "#f5f5f5" }}>
        <div className={styles.chatContainer}>
          <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <User data={[{Id: profile.Id, Avatar: profile.Avatar, FirstName: profile.First_Name, LastName: profile.Last_Name }]} route={"/profile"} />
            </div>

            <div className={styles.chatContent} ref={containerRef}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              {!hasMore && messages.length !== 0 && (
                <div className={styles.emptyState}>
                  <p>No more messages</p>
                </div>
              )}
              {loading && <p>loading...</p>}
              {messages.map((msg, index) => (
                // ayoub --- msg id
                <div
                  id={`msg${msg.messageid}`}
                  key={index}
                  className={`${styles.messageRow} ${isCurrentUser(msg) ? styles.outgoing : styles.incoming
                    }`}
                >
                  <div
                    className={
                      isCurrentUser(msg)
                        ? styles.outgoingMessage
                        : styles.incomingMessage
                    }
                  >
                    {!isCurrentUser(msg) && (
                      <div className={styles.messageSender}>{msg.fullname}</div>
                    )}
                    <div className={styles.messageContent}>{msg.message}</div>
                    <div className={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.chatFooter}>
              <div className={styles.emojiPicker}>
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={styles.emojiButton}
                    onClick={() => setInputMessage((prev) => prev + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  placeholder={
                    isConnected ? "Type a message..." : "Connecting..."
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={!isConnected}
                  className={styles.messageInput}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !inputMessage.trim()}
                  className={styles.sendButton}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>Private Chat</div>
        <UsersFollowing userID={window.userState.id} route={"/chat"} />
      </div>
    </>
  );
}
