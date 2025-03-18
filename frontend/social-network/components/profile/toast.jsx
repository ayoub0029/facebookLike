  "use client"

  import { useState, useEffect, useRef } from "react"
  import { createPortal } from "react-dom"
  import style from "../../styles/toast.module.css"

  // showToast("error", "Please review your information before submitting.")
  // showToast("information", "Please review your information before submitting.")
  // showToast("success", "Please review your information before submitting.")
  //  // showToast("success", "Please review your information before submitting.")
  export default function ToastNotification({
    variant = "success",
    duration = 4000,
    open,
    onClose,
    message = "Your message has been sent successfully...",
    title,
    position = "top-right",
  }) {
    const typesIcon = {
      success: <i className="fa-solid fa-check"></i>,
      information: <i className="fa-solid fa-info-circle"></i>,
      error: <i className="fa-solid fa-exclamation-circle"></i>,
      message: <i className="fa-solid fa-comment"></i>
    }

    const [isActive, setIsActive] = useState(false)
    const [icon, setIcon] = useState(typesIcon.success)
    const [color, setColor] = useState("green")
    const timerRef = useRef(null)

    useEffect(() => {
      switch (variant) {
        case "information":
          setIcon(typesIcon.information)
          setColor("orange")
          break
        case "error":
          setIcon(typesIcon.error)
          setColor("red")
          break
        case "message":
          setIcon(typesIcon.message)
          setColor("lightseagreen")
          break
        default:
          setIcon(typesIcon.success)
          setColor("green")
      }
    }, [variant])

    function handleClose() {
      setIsActive(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setTimeout(() => onClose(false), 300)
    }

    useEffect(() => {
      const handleEscKey = (event) => {
        if (event.key === "Escape" && isActive) {
          handleClose()
        }
      }

      window.addEventListener("keydown", handleEscKey)
      return () => window.removeEventListener("keydown", handleEscKey)
    }, [isActive])

    // Open/close effect
    useEffect(() => {
      setIsActive(open)

      if (open) {
        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
          setIsActive(false)
          setTimeout(() => onClose(false), 300)
        }, duration)

        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current)
          }
        }
      }
    }, [open, duration, onClose])

    if (!open && !isActive) return null

    const displayTitle = title || variant

    const positionClass = style[position] || style["top-right"]

    if (typeof document === "undefined") return null

    return createPortal(
      <div
        className={`${style.toastContainer} ${isActive ? style.active : ""} ${positionClass}`}
        role="alert"
        aria-live="assertive"
      >
        <div className={style.rowContanr}>
          <div className={style.icon} style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div className={style.content}>
            <div className={style.header}>
              <span className={style.title}>{displayTitle}</span>
              <button onClick={handleClose} className={style.closeButton} aria-label="Close notification">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <span className={style.message}>{message}</span>
          </div>
        </div>

        <div
          className={style.progressBar}
          style={{
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      </div>,
      document.body,
    )
  }

