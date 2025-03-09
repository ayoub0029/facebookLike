import style from "../../styles/profile.module.css";

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


// export  function Alert({ children, type, message }) {
//   const [isShow, setIsShow] = useState(true);

//   const renderElAlert = function () {
//     return React.cloneElement(children);
//   };

//   const handleClose = (e) => {
//     e.preventDefault();
//     setIsShow(false);
//   };

//   return (
//     <div className={css(style.alert, style[type], !isShow && style.hide)}>
//       <span className={style.closebtn} onClick={handleClose}>
//         &times;
//       </span>
//       {children ? renderElAlert() : message}
//     </div>
//   );
// }