import { useReducer, useState, useEffect } from "react";

import "./Styles/App.css";
import "./Styles/panels.css";

import Info from "./Components/Info";
import Grid from "./Components/Grid";
import Upgrades from "./Components/Upgrades";

import plants from "./data/plants.json";
import upgrades from "./data/upgrades.json";

import reducer from "./functions/reducer";
import PeriodicPopup from "./Components/PeriodicPopup";
import { calculatePayment, calculateRunningCost, getRandomNums, randint } from "./functions/utils";

function App() {
  const initialWorld = {
    playerStats: {
      money: 10000,
      output: 0,
      demand: 10,
      co2: 0,
      upgrades: [], // stores objects
      plants: [],
    },
    costModifier: 1,
    payModifier: 1,
    outputModifier: 1,
    co2Modifier: 1,
    availablePlants: [1, 4], // stores ids of unlocked
    availableUpgrades: [1, 4],
    runningCostInterval: 20,
    payInterval: 30,
    demandGrowInterval: 15,
    co2Limit: 100,
    houseCount: 10,
    officeCount: 0,
  };

  const [state, dispatch] = useReducer(reducer, initialWorld);

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

  const DAY_INTERVAL = 1;

  const [showProfitWindow, setShowProfitWindow] = useState(false);
  const [showRunningCostWindow, setShowRunningCostWindow] = useState(false);
  const [showPopulationChangeWindow, setShowPopulationChangeWindow] = useState(false);
  const [days, setDays] = useState(0);
  const [demandGrowthAmount, setDemandGrowthAmount] = useState(1);

  useEffect(() => {
    if (showProfitWindow || showRunningCostWindow || showPopulationChangeWindow) return;
    const intervalId = setInterval(() => {
      setDays(n => n + 1);
    }, 1000 * DAY_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [showProfitWindow, showRunningCostWindow, showPopulationChangeWindow]);

  useEffect(() => {
    // only show when started producing power
    // and pause timer when the popup is being shown
    if (days === 0 || state.playerStats.output === 0) return;

    if (days % state.payInterval === 0) {
      dispatch({ type: "get-paid" });
      setShowProfitWindow(true);
    }
  }, [days, state.output, state.payInterval]);

  useEffect(() => {
    if (days === 0 || state.playerStats.plants.length === 0) return;

    if (state.playerStats.money < calculateRunningCost(state.playerStats.plants)) {
      dispatch({ type: "game-over" }); // TODO: implement this
      return;
    }

    if (days % state.runningCostInterval === 0) {
      dispatch({ type: "pay-running-cost" });
      setShowRunningCostWindow(true);
    }
  }, [days, state.playerStats.plants, state.runningCostInterval]);

  useEffect(() => {
    console.log(111)
    if (
      days === 0 ||
      days % state.demandGrowInterval !== 0 ||
      state.playerStats.output < state.playerStats.demand
    )
      return;
    
    const toAdd = 3;
    if (demandGrowthAmount < 0) {
      dispatch({ type: "grow-population", payload: demandGrowthAmount * toAdd});
      setShowPopulationChangeWindow(true);

      if (state.playerStats.demand < 0) {
        dispatch({ type: "game-over" }); // TODO: implement this
      }
      return;
    }
    for (let index = 0; index < toAdd; index++) {
      const x = randint(0, 9);
      const y = randint(0, 9);
      if (gridState[x][y] === null) {
        setGridStateTo([x, y], "house");
        dispatch({ type: "grow-population", payload: demandGrowthAmount});
      }
    }
    setShowPopulationChangeWindow(true);
  }, [days, state.demandGrowInterval]);

  useEffect(() => {
    if (state.playerStats.co2 >= state.co2Limit) {
      setDemandGrowthAmount(-1);
    }
  }, [state.co2Limit, state.playerStats.co2])

  const setGridStateTo = (pos, newValue) => {
    setGridState(prev => {
      const newGrid = [...prev];
      newGrid[pos[0]][pos[1]] = newValue;
      return newGrid;
    });
  };

  return (
    <>
      <Info playerStats={state.playerStats} co2Limit={state.co2Limit} days={days} />
      <Upgrades
        allUpgrades={upgrades}
        availableUpgrades={state.availableUpgrades}
        playerUpgrades={state.playerStats.upgrades}
        money={state.playerStats.money}
        buyUpgradeHandler={payload => dispatch({ type: "buy-upgrade", payload })}
      />
      <Grid
        allPlants={plants}
        availablePlants={state.availablePlants}
        money={state.playerStats.money}
        gridState={gridState}
        buyPlantHandler={payload => dispatch({ type: "buy-plant", payload })}
        sellPlantHandler={payload => dispatch({ type: "sell-plant", payload })}
        upgradeHouseHandler={() => dispatch({ type: "upgrade-house" })}
        setGridStateTo={setGridStateTo}
      />
      {showProfitWindow && (
        <PeriodicPopup
          title="Profit Summary"
          text={
            `You reiceved $${calculatePayment(
              state.houseCount,
              state.officeCount,
              state.payModifier,
              state.playerStats.output / state.playerStats.demand
            )}. \n` +
            `Houses count: ${state.houseCount} \n` +
            `Offices count: ${state.officeCount} \n` +
            `Demand Fulfilled: ${Math.floor((state.playerStats.output / state.playerStats.demand) * 100)}% \n`
          }
          closeFunc={() => setShowProfitWindow(false)}
        />
      )}
      {showRunningCostWindow && (
        <PeriodicPopup
          title="Running Cost Summary"
          text={`You paid $${calculateRunningCost(
            state.playerStats.plants, state.costModifier
          )} for maintenance and resources needed to power your facilities.`}
          closeFunc={() => setShowRunningCostWindow(false)}
        />
      )}
      {showPopulationChangeWindow && (
        <PeriodicPopup
          title="Population Change"
          text={
            demandGrowthAmount > 0 ? 
            `Because of your excellent power services, population has increased by 3!`
            : 
            `Due to high CO2 emissions, population has decreased by 3!`
          }
          closeFunc={() => setShowPopulationChangeWindow(false)}
        />
      )}
      <button onClick={() => dispatch({ type: "debug-unlock" })}>unlock</button>
      <button
        onClick={() => {
          new Audio("/sound/HYP - Miracle.mp3").play();
        }}
      >
        music
      </button>
      <button
        onClick={() => {
          new Audio("/sound/HYP - Criminal(Sound Effect Ver.).mp3").play();
        }}
      >
        music
      </button>
    </>
  );
}

export default App;

