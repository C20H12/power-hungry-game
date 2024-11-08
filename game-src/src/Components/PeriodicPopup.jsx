function PeriodicPopup({ title, text, closeFunc, dialogue = null }) {
  return (
    <>
      <div className="overlay" onClick={closeFunc}></div>
      <div className="popup">
        <h2>{title}</h2>
        <p>{text}</p>
        {dialogue && (
          <div>
            <img src={dialogue.img} alt="person" />
            <p>{dialogue.text}</p>
          </div>
        )}
        <button onClick={closeFunc}>Confirm</button>
      </div>
    </>
  );
}

export default PeriodicPopup;
