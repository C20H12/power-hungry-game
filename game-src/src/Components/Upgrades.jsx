import { useState } from "react";
import BuyMenu from "./BuyMenu";

function Upgrades({ allUpgrades, availableUpgrades, playerUpgrades, money, buyUpgradeHandler }) {
  const [showUpgradesMenu, setShowUpgradesMenu] = useState(false);

  return (
    <div className="upgrades">
      <div className="player-upgrades">
        {playerUpgrades.map((upgrade, i) => (
          <div key={upgrade.id}>
            <img src={`/assets/${upgrade.image}`} alt={upgrade.name} className="icon" />
            {/* band aid fix to stop the desc from overflowing, change later with better css */}
            <div className={"description " + (i > 5 ? "desc-low" : "")}>{upgrade.description}</div>
          </div>
        ))}
        <div>
          <img
            src="/ui/upgrade.jpg"
            alt="open"
            onClick={() => setShowUpgradesMenu(true)}
            className="open-all-upg"
          />
          <div className={"description " + (playerUpgrades.length >= 5 ? "desc-low" : "")}>Open all upgrades</div>
        </div>
      </div>

      {showUpgradesMenu && (
        <BuyMenu
          title="Upgrades"
          closeFunc={() => setShowUpgradesMenu(false)}
          itemList={allUpgrades}
          availableItemList={availableUpgrades}
          ownedItemList={playerUpgrades}
          money={money}
          buyHandler={item => {
            buyUpgradeHandler(item);
            setShowUpgradesMenu(false);
          }}
        />
      )}
    </div>
  );
}

export default Upgrades;
