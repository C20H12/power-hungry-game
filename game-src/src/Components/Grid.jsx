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
  unlockTileHandler,
  setGridStateTo,
  upgradeHouseCost = 1000,
}) {

  // stores the selected cell's coordinates
  const [selectedCell, setSelectedCell] = useState(null);
  // stores the type of menu to show
  const [menuType, setMenuType] = useState(null);
  // stores the position of the menu in px, in screen space
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleCellClick = (i, j, cellElement) => {
    const cell = gridState[i][j];
    if (cell.locked) {
      setMenuType("lock");
    } else if (cell.value === null) {
      setMenuType("buy");
    } else if (cell.value === "house") {
      setMenuType("upgrade");
    } else if (cell.value.id != null) {
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
              className={(gridState[i][j].locked ? "cell-locked " : "") + "grid-cell"}
              key={"" + i + j}
              data-coord={`${i},${j}`}
              onClick={e => {
                handleCellClick(i, j, e.target)
                playClickSound()
              }}
              style={col.value == null ? {backgroundImage: `url(/assets/tiles/${col.bg}.png)`} : {}}
            >
              {col.value === "house" && <img src="/assets/house.png" alt="House" />}
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
              ownedItemList={
                // make the hydro plant only available on water, others not available
                gridState[selectedCell[0]][selectedCell[1]].bg === "rive" ?
                Array(19).fill(null).map((_, i) => ({id: i})).filter(item => ![7, 8, 9].includes(item.id))
                : [{id: 7}, {id: 8}, {id: 9}]
              }
              money={money}
              buyHandler={item => {
                let item1 = item;
                // bonus power for wind on hill tile
                if (item.name.includes("Wind")) {
                  if (gridState[selectedCell[0]][selectedCell[1]].bg === "hill") {
                    item1 = {...item, output: item.output + 10}
                  } else {
                    item1 = {...item, output: item.output - 10}
                  }
                }
                buyPlantHandler(item1);
                setGridStateTo(selectedCell, item1);
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
                  upgradeHouseHandler();
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
          {menuType === "lock" && (
            <div
              className="grid-menu"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <h3>Locked</h3>
              <p>Unlock this area? Costs ${100 + 50 * gridState.flat().filter(cell => !cell.locked).length}</p>
              <button
                onClick={() => {
                  // price is higher when more tiles are unlocked
                  const price = 100 + 50 * gridState.flat().filter(cell => !cell.locked).length;
                  unlockTileHandler(price);
                  setGridStateTo(selectedCell, null, true);
                  closeMenu();
                }}
              >Confirm</button>
              <button onClick={closeMenu}>Close</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Grid;
