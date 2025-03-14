"use client"

import { createContext, useContext, useState } from "react"
import ToastNotification from "@/components/profile/toast.jsx"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    variant: "success",
    message: "",
    title: "",
    duration: 4000,
  })

  const showToast = (variant, message, title = "", duration = 4000) => {
    setToast({ open: true, variant, message, title, duration })
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        title={toast.title}
        duration={toast.duration}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
