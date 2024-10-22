function PeriodicPopup({ title, text, closeFunc }) {
  return (
    <>
      <div className="overlay" onClick={closeFunc}></div>
      <div className="popup">
        <h2>{title}</h2>
        <p>{text}</p>
        <button onClick={closeFunc}>Confirm</button>
      </div>
    </>
  );
}

export default PeriodicPopup;