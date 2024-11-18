import { useState, useEffect } from 'react';

function PeriodicPopup({ shouldShow, title, text, closeFunc, dialogue = null }) {
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    if (shouldShow) {
      setShowCount(prevCount => prevCount + 1);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (showCount > 3) {
      const timer = setTimeout(closeFunc, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCount, closeFunc]);

  if (!shouldShow) return null;

  return (
    <>
      {showCount <= 3 && <div className="overlay" onClick={closeFunc}></div>}
      <div className={"popup" + (showCount > 3 ? " popup-side" : "")}>
        <h2>{title}</h2>
        <p>{text}</p>
        {dialogue && (
          <div>
            <img src={dialogue.img} alt="person" />
            <div>
              <h3>{dialogue.title}</h3>
              <p>{dialogue.text}</p>
            </div>
          </div>
        )}
        <button onClick={closeFunc}>Confirm</button>
      </div>
    </>
  );
}

export default PeriodicPopup;
