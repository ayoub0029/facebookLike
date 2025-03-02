"use client"

import { useState, useEffect } from 'react';
import style from "../styles/model.module.css";


export default function Modal({ isOpen, onClose, children }) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={style.modalOverlay}>
      {/* Backdrop */}
      <div
        className={style.modalBackdrop}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={style.modalContent}>
        <button
          onClick={onClose}
          className={style.closeButton}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}