import style from "../../styles/profile.module.css"

export  function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className={style["modal-overlay"]} onClick={onClose}>
      <div className={style["modal-content"]} onClick={e => e.stopPropagation()}>
        <div className={style["modal-header"]}>
          <h2 className={style["modal-title"]}>{title}</h2>
          <button className={style["modal-close"]} onClick={onClose}>x</button>
        </div>
        <div className={style["modal-body"]}>
          {children}
        </div>
      </div>
    </div>
  );
};
