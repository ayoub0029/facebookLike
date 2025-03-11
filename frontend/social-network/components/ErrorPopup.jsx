import React from 'react';
import styles from './ErrorPopup.module.css';

const ErrorPopup = ({ isOpen, onClose, errorContent }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.container} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.content}>
          <h2 className={styles.title}>Oops!</h2>
          <div 
            className={styles.errorMessage}
            dangerouslySetInnerHTML={{ __html: errorContent }}
          />
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;