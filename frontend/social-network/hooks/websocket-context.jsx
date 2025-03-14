"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"

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

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      console.log("WebSocket Connected")
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data)
      if (messageHandlerRef.current) {
        messageHandlerRef.current(event.data)
      } else {
        alert(`New message: ${event.data}`)
      }
    }

    socket.onclose = () => {
      console.log("WebSocket Disconnected")
      setIsConnected(false)

      setTimeout(() => {
        
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