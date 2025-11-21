"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useToast } from "./toast-context.jsx"
import { NotificationsTypes } from "@/components/notification/Notification.jsx"

const WebSocketContext = createContext({
  socket: null,
  isConnected: false,
  sendMessage: () => { },
  setMessageHandler: () => { },
})

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)
  const messageHandlerRef = useRef(null)
  const { showToast } = useToast()

  // Function to fix server timestamps
  const fixServerTimestamp = (data) => {
    if (data.Type === 'Group_message' && data.timestamp === "0001-01-01T00:00:00Z") {
      return {
        ...data,
        timestamp: new Date().toISOString() // Replace invalid timestamp with current time
      }
    }
    return data
  }

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.Error) {
        showToast("error", data.Error)
        return
      }

      // Fix the timestamp before passing to handler or toast
      const fixedData = fixServerTimestamp(data)

      if (messageHandlerRef.current) {
        messageHandlerRef.current(fixedData) // Pass the fixed data
      } else {
        switch (fixedData.Type) {
          case 'message':
            showToast("message", fixedData.message, fixedData.fullname)
            break;

          case 'Group_message':
            showToast("message", `${fixedData.fullname}: ${fixedData.message}`, `Group: ${fixedData.groupname}`)
            break;

          default:
            showToast("information", `${NotificationsTypes[fixedData.Type].message} from ${fixedData.Sender}`, NotificationsTypes[fixedData.Type].type, 5000)
            break;
        }
      }
    }

    socket.onclose = () => {
      setIsConnected(false)

      setTimeout(() => {
        // Optional: Add reconnection logic here
      }, 3000);
    }

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error)
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [])

  const sendMessage = (message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message)
    } else {
      console.error("WebSocket is not connected")
    }
  }

  const setMessageHandler = (handler) => {
    messageHandlerRef.current = handler
  }

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        sendMessage,
        setMessageHandler,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}