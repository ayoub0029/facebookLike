"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "@/hooks/websocket-context.jsx";
import styles from "../../chat.module.css";
import { useParams, useSearchParams } from "next/navigation";
import { fetchApi } from "@/api/fetchApi";
import { useToast } from "@/hooks/toast-context";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const GroupID = params.GroupID;

  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullname");

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
  const [groupProfile, setGroupProfile] = useState(null)

  useEffect(() => {
    const fetchGroupProfile = async () => {
      setLoading(true)
      try {
        const response = await fetchApi(
          `/group?group=${GroupID}`,
          'GET',
          null,
          false
        );
        if (response.error || response.status >= 400) {
          setError(404);
        } else {
          setGroupProfile(response);
        }
      } catch (err) {
        console.error('Error fetching Group Profile:', err);
        showToast("error", err || "Unknown error")
      } finally {
        setLoading(false);
      }
    }
    fetchGroupProfile()
  }, [GroupID])
  console.log(groupProfile);


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
          `/chats/group?group_id=${GroupID}&page=${currPage}`,
          "GET"
        );
        console.log(data);
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
    [GroupID, setScrollBackId]
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
      console.log(data);
      // Type: 'Group_message', fullname: 'sss sss', groupname: 'sssrrr', groupid: 5, senderid: 26, …}
      try {
        if (data.groupid === Number.parseInt(GroupID)) {
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
  }, [setMessageHandler, GroupID]);

  // handel send message
  function handleSendMessage(e) {
    e.preventDefault();

    if (!inputMessage.trim() || !isConnected) return;

    const messageObj = {
      type: "groupChat",
      content: {
        GroupID: Number.parseInt(GroupID),
        SenderID: window.userState.id,
        message: inputMessage,
        // timestamp: new Date(),
      },
    };

    sendMessage(JSON.stringify(messageObj));

    const localMessageObj = {
      receiver_id: GroupID,
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
  if (!groupProfile) return <div> Loading... </div>;

  return (
    <>
      <button onClick={toggleMenu} className="rightMenuToggle">
        <i className="fas fa-bars"></i>
      </button>

      <aside className="feed" style={{ backgroundColor: "#f5f5f5" }}>
        <div className={styles.chatContainer}>
          <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <Link href={`/group/${groupProfile.Id}`}
                key={groupProfile.id}>
                <h2 className={styles.chatTitle}>
                  Group : {groupProfile.name}
                </h2>
              </Link>
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
        {/* <div style={{ fontSize: "18px", fontWeight: "bold" }}>Private Chat</div>
        <UsersFollowing GroupID={window.userState.id} route={"/chat"} /> */}
      </div>
    </>
  );
}
