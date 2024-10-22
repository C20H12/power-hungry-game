import { useEffect, useState } from "react";
import { getRandomNums, randint } from "../functions/utils";
import BuyMenu from "./BuyMenu";

function Grid({
  allPlants,
  availablePlants,
  money,
  buyPlantHandler,
  sellPlantHandler,
  upgradeHouseHandler,
  populationGrowInterval,
  populationGrowHandler,
  popupShown,
  upgradeHouseCost = 1000,
}) {
  const [gridState, setGridState] = useState(() => {
    const grid = [];
    const initHouses = getRandomNums(10, 0, 100);
    for (let index = 0; index < 10; index++) {
      grid.push(
        Array(10)
          .fill(null)
          .map((_, i) => (initHouses.includes(index * 10 + i + 1) ? "house" : null))
      );
    }
    return grid;
  });

  const [selectedCell, setSelectedCell] = useState(null);
  const [menuType, setMenuType] = useState(null);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleCellClick = (i, j, cellElement) => {
    const cell = gridState[i][j];
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

  const setGridStateTo = (pos, newValue) => {
    setGridState(prev => {
      const newGrid = [...prev];
      newGrid[pos[0]][pos[1]] = newValue;
      return newGrid;
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (popupShown) return;
      const toAdd = 3;
      for (let index = 0; index < toAdd; index++) {
        const x = randint(0, 9);
        const y = randint(0, 9);
        if (gridState[x][y] === null) {
          setGridStateTo([x, y], "house");
          populationGrowHandler();
        }
      }
    }, populationGrowInterval * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div className="grid-wrapper">
        {gridState.map((row, i) =>
          row.map((col, j) => (
            <div
              className="grid-cell"
              key={"" + i + j}
              data-coord={`${i},${j}`}
              onClick={e => handleCellClick(i, j, e.target)}
            >
              {col === "house" && <img src="/assets/house.png" alt="House" />}
              {col === "office" && <img src="/assets/office.png" alt="Office" />}
              {typeof col !== "string" && col != null && <img src={"/assets/" + col.image} alt="Plant" />}
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
                  sellPlantHandler(gridState[selectedCell[0]][selectedCell[1]]);
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
