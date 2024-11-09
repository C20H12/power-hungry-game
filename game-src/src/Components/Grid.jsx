import { useState } from "react";
import BuyMenu from "./BuyMenu";
import { setAdjacentCellsPower } from "../functions/utils";

function Grid({
  allPlants,
  availablePlants,
  allProperties,

  money,

  buyPlantHandler,
  sellPlantHandler,
  buyPropertyHandler,
  unlockTileHandler,

  gridState,
  setGridState,
}) {
  // stores the selected cell's coordinates
  const [selectedCell, setSelectedCell] = useState(null);
  // stores the type of menu to show
  const [menuType, setMenuType] = useState(null);
  // stores the position of the menu in px, in screen space
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  // stores the selected tab in the buy menu, plants or houses
  const [selectedTab, setSelectedTab] = useState("plants");

  const handleCellClick = (i, j, cellElement) => {
    const cell = gridState[i][j];
    if (cell.locked) {
      setMenuType("lock");
    } else if (cell.value === null) {
      setMenuType("buy");
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
    audio.play().catch(() => console.log("didn't play sound"));
  };

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
                handleCellClick(i, j, e.target);
                playClickSound();
              }}
              style={col.value == null ? { backgroundImage: `url(/assets/tiles/${col.bg}.png)` } : {}}
            >
              {col.value === "house" && (
                <img src={`/assets/house${col.hasPower ? "_power" : ""}.png`} alt="House" />
              )}
              {col.value === "office" && (
                <img src={`/assets/office${col.hasPower ? "_power" : ""}.png`} alt="Office" />
              )}
              {typeof col.value !== "string" && col.value != null && (
                <img src={"/assets/" + col.value.image} alt="Plant" />
              )}
            </div>
          ))
        )}
      </div>

      {selectedCell && (
        <div>
          {menuType === "buy" && (
            <div className="grid-buy-tabs">
              <div className="tab-wrapper">
                <div
                  className={`tab ${selectedTab === "plants" ? "active" : ""}`}
                  onClick={() => setSelectedTab("plants")}
                >
                  Plants
                </div>
                <div
                  className={`tab ${selectedTab === "houses" ? "active" : ""}`}
                  onClick={() => setSelectedTab("houses")}
                >
                  Properties
                </div>
              </div>
              {selectedTab === "plants" && (
                <BuyMenu
                  title="Plants"
                  closeFunc={closeMenu}
                  itemList={allPlants}
                  availableItemList={availablePlants}
                  ownedItemList={
                    // check the mapExclusion of the available plants, disable if selected tile is in it
                    allPlants.filter(plant => plant.mapExclusion.includes(gridState[selectedCell[0]][selectedCell[1]].bg))
                  }
                  money={money}
                  buyHandler={item => {
                    let item1 = item;
                    // if has map bonus, apply the ones that matches the current selected cell
                    if (item.mapBonus) {
                      for (const mb of item.mapBonus) {
                        const { tile, toChange, value } = mb;
                        if (gridState[selectedCell[0]][selectedCell[1]].bg === tile) {
                          item1 = { ...item, [toChange]: item[toChange] + value };
                        }
                      }
                    }
                    buyPlantHandler(item1);
                    setGridState(prev => {
                      const newGrid = [...prev];
                      newGrid[selectedCell[0]][selectedCell[1]].value = item1;
                      // set the cell and 2 rings of cells around it to powered
                      setAdjacentCellsPower(selectedCell, newGrid, true);
                      return newGrid;
                    });
                    closeMenu();
                  }}
                />
              )}
              {selectedTab === "houses" && (
                <BuyMenu
                  title="Properties"
                  closeFunc={closeMenu}
                  itemList={allProperties}
                  availableItemList={allProperties.map(pro => pro.id)}
                  ownedItemList={[]}
                  money={money}
                  buyHandler={item => {
                    buyPropertyHandler(item);
                    setGridState(prev => {
                      const newGrid = [...prev];
                      newGrid[selectedCell[0]][selectedCell[1]].value = item.name;
                      return newGrid;
                    });
                    closeMenu();
                  }}
                />
              )}
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
                  setGridState(prev => {
                    const newGrid = [...prev];
                    newGrid[selectedCell[0]][selectedCell[1]].value = null;
                    // set the cell and 8 cells around it to not powered
                    setAdjacentCellsPower(selectedCell, newGrid, false);
                    return newGrid;
                  });
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
              <p>
                Unlock this area? Costs ${100 + 50 * gridState.flat().filter(cell => !cell.locked).length}
              </p>
              <button
                onClick={() => {
                  // price is higher when more tiles are unlocked
                  const price = 100 + 50 * gridState.flat().filter(cell => !cell.locked).length;
                  unlockTileHandler(price);
                  setGridState(prev => {
                    const newGrid = [...prev];
                    newGrid[selectedCell[0]][selectedCell[1]].locked = false;
                    return newGrid;
                  });
                  closeMenu();
                }}
              >
                Confirm
              </button>
              <button onClick={closeMenu}>Close</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Grid;
