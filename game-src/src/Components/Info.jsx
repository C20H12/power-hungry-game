function Info(props) {
  const { playerStats, co2Limit, days } = props;

  return (
    <div className="info">
      <div className="info-entry money">
        <img src="/ui/money.jpg" alt="Money Icon" className="icon" />
        <span>${playerStats.money}</span>
        <div className="description">Total money available</div>
      </div>
      
      <div className="info-entry time">
        <img src="/ui/time.jpg" alt="days" className="icon" />
        <span>Day: {days}</span>
        <div className="description">Days since the beginning.</div>
      </div>
      
      <div className="info-entry">
        <img src="/ui/ex-mark.jpg" alt="Demand Icon" className="icon" />
        <span>{playerStats.demand}</span>
        <span className="unit">Kw</span>
        <div className="description">Current power demanded by the users.</div>
      </div>

      <div className="info-entry">
        <img src="/ui/electric.jpg" alt="Electric Icon" className="icon" />
        <div className="progress-bar">
          <div className="progress" style={{ width: `${playerStats.output / playerStats.demand * 100}%` }}>
            {`${playerStats.output}/${playerStats.demand}`}
          </div>
          <span className="unit">Kw</span>
        </div>
        <div className="description">Current power output from your plants.</div>
      </div>

      <div className="info-entry">
        <img src="/ui/co2.jpg" alt="CO2 Icon" className="icon" />
        <div className="progress-bar">
          <div className="progress" style={{ width: `${playerStats.co2 / co2Limit * 100}%` }}>
            {playerStats.co2}
          </div>
          <span className="unit">m³</span>
        </div>
        <div className="description">Current CO2 emissions.</div>
      </div>
    </div>
  );
}

export default Info;