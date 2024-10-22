function Info(props) {
  const { playerStats, co2Limit } = props;

  const descriptions = {
    money: "Total money available",
    output: "Current power output",
    demand: "Current power demand",
    co2: "Current CO2 emissions",
  };

  return (
    <div className="info">
      <div className="info-entry money">
        <img src="/ui/money.jpg" alt="Money Icon" className="icon" />
        <span>${playerStats.money}</span>
        <div className="description">{descriptions.money}</div>
      </div>
      
      <div className="info-entry">
        <img src="/ui/ex-mark.jpg" alt="Demand Icon" className="icon" />
        <span>{playerStats.demand}</span>
        <span className="unit">Kw</span>
        <div className="description">{descriptions.demand}</div>
      </div>

      <div className="info-entry">
        <img src="/ui/electric.jpg" alt="Electric Icon" className="icon" />
        <div className="progress-bar">
          <div className="progress" style={{ width: `${playerStats.output / playerStats.demand * 100}%` }}>
            {`${playerStats.output}/${playerStats.demand}`}
          </div>
          <span className="unit">Kw</span>
        </div>
        <div className="description">{descriptions.output}</div>
      </div>

      <div className="info-entry">
        <img src="/ui/co2.jpg" alt="CO2 Icon" className="icon" />
        <div className="progress-bar">
          <div className="progress" style={{ width: `${playerStats.co2 / co2Limit * 100}%` }}>
            {playerStats.co2}
          </div>
          <span className="unit">m³</span>
        </div>
        <div className="description">{descriptions.co2}</div>
      </div>
    </div>
  );
}

export default Info;