const ErrorPopup = ({ isOpen, onClose, errorContent }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fullscreen" onClick={onClose}>
        <div className="pop_up" >
          <div>
            <h2>Oops!</h2>
            <div dangerouslySetInnerHTML={{ __html: errorContent }}/>
          </div>
          <div>
            <button onClick={onClose}> Close </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ErrorPopup;