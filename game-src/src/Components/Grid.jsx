import { useState } from "react";
import BuyMenu from "./BuyMenu";


function Grid({
  allPlants,
  availablePlants,
  money,
  gridState,
  buyPlantHandler,
  sellPlantHandler,
  upgradeHouseHandler,
  setGridStateTo,
  upgradeHouseCost = 1000,
}) {


  const [selectedCell, setSelectedCell] = useState(null);
  const [menuType, setMenuType] = useState(null);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleCellClick = (i, j, cellElement) => {
    const cell = gridState[i][j].value;
    if (cell === null) {
      setMenuType("buy");
    } else if (cell === "house") {
      setMenuType("upgrade");
    } else if (cell.id != null) {
      setMenuType("sell");
    }
    setSelectedCell([i, j]);

    const rect = cellElement.getBoundingClientRect();
    setMenuPosition({ top: rect.top, left: rect.left - 50 });
  };

  const closeMenu = () => {
    setSelectedCell(null);
    setMenuType(null);
  };



  const playClickSound = () => {
    const audio = new Audio("/sound/click-2.mp3");
    audio.play().catch(() => console.log("didn't play sound"))
  }


  return (
    <>
      <div className="grid-wrapper">
        {gridState.map((row, i) =>
          row.map((col, j) => (
            <div
              className="grid-cell"
              key={"" + i + j}
              data-coord={`${i},${j}`}
              onClick={e => {
                handleCellClick(i, j, e.target)
                playClickSound()
              }}
              style={col.value == null ? {backgroundImage: `url(/assets/tiles/${col.bg}.png)`} : {}}
            >
              {col.value === "house" && <img src="/assets/house.png" alt="House" />}
              {col.value === "house-empty" && <img className="grid-house-empty" src="/assets/house.png" alt="House" />}
              {col.value === "office" && <img src="/assets/office.png" alt="Office" />}
              {typeof col.value !== "string" && col.value != null && <img src={"/assets/" + col.value.image} alt="Plant" />}
            </div>
          ))
        )}
      </div>

      {selectedCell && (
        <div>
          {menuType === "buy" && (
            <BuyMenu
              title="Plants"
              closeFunc={closeMenu}
              itemList={allPlants}
              availableItemList={availablePlants}
              ownedItemList={[]}
              money={money}
              buyHandler={item => {
                buyPlantHandler(item);
                setGridStateTo(selectedCell, item);
                closeMenu();
              }}
            />
          )}
          {menuType === "upgrade" && (
            <div
              className="grid-menu"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <h3>Upgrade to Office</h3>
              <p>A commercial area uses more power and will produce more payout.</p>
              <button
                disabled={money < upgradeHouseCost} // Example cost for upgrade
                onClick={() => {
                  upgradeHouseHandler(selectedCell);
                  setGridStateTo(selectedCell, "office");
                  closeMenu();
                }}
              >
                {money < upgradeHouseCost ? "Not enough money" : "Upgrade for $1000"}
              </button>
              <button onClick={closeMenu}>Cancel</button>
            </div>
          )}
          {menuType === "sell" && (
            <div
              className="grid-menu"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <h3>Sell Plant</h3>
              <p>Warning, you will only get half the original cost back.</p>
              <button
                onClick={() => {
                  // for this menu to show up, assume the grid at i,j is a plant obj
                  sellPlantHandler(gridState[selectedCell[0]][selectedCell[1]].value);
                  setGridStateTo(selectedCell, null);
                  closeMenu();
                }}
              >
                Confirm
              </button>
              <button onClick={closeMenu}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Grid;
