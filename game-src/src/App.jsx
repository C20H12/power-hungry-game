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
import { calculatePayment, calculateRunningCost } from "./functions/utils";

function App() {
  const initialWorld = {
    playerStats: {
      money: 10000000,
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
    availableUpgrades: [1, 3],
    runningCostInterval: 20,
    payInterval: 30,
    demandGrowInterval: 10,
    co2Limit: 300,
    houseCount: 10,
    officeCount: 0,
  };

  const [state, dispatch] = useReducer(reducer, initialWorld);

  const [showProfitWindow, setShowProfitWindow] = useState(false);

  useEffect(() => {
    // only show when started producing power
    // and pause timer when the popup is being shown
    if (state.output === 0 || showProfitWindow) return;
    const intervalId = setInterval(() => {
      dispatch({
        type: "get-paid",
      });
      setShowProfitWindow(true);
    }, 1000 * state.payInterval);
    return () => {
      clearInterval(intervalId);
    };
  }, [showProfitWindow, state.payInterval, state.output]);

  const [showRunningCostWindow, setShowRunningCostWindow] = useState(false);

  useEffect(() => {
    if (state.playerStats.plants.length === 0 || showRunningCostWindow) return;
    
    if (state.playerStats.money < calculateRunningCost(state.playerStats.plants)) {
      dispatch({ type: "game-over" });
      return;
    }
    
    const intervalId = setInterval(() => {
      console.log(1)
      dispatch({ type: "pay-running-cost" });
      setShowRunningCostWindow(true);
    }, 1000 * state.runningCostInterval);
    return () => {
      clearInterval(intervalId);
    };
  }, [showRunningCostWindow, state.playerStats.money, state.playerStats.plants, state.playerStats.plants.length, state.runningCostInterval]);

  return (
    <>
      <Info playerStats={state.playerStats} co2Limit={state.co2Limit} />
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
        buyPlantHandler={payload => dispatch({ type: "buy-plant", payload })}
        sellPlantHandler={payload => dispatch({ type: "sell-plant", payload })}
        upgradeHouseHandler={() => dispatch({ type: "upgrade-house" })}
        populationGrowInterval={state.demandGrowInterval}
        populationGrowHandler={() => dispatch({ type: "grow-population" })}
        popupShown={showProfitWindow || showRunningCostWindow}
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
            `Demand Fulfilled: ${(state.playerStats.output / state.playerStats.demand) * 100}% \n`
          }
          closeFunc={() => setShowProfitWindow(false)}
        />
      )}
      {showRunningCostWindow && 
        <PeriodicPopup
          title="Running Cost Summary"
          text={`You paid $${calculateRunningCost(state.playerStats.plants)} for maintenance and resources needed to power your facilities.`}
          closeFunc={() => setShowRunningCostWindow(false)}
        />
      }
    </>
  );
}

export default App;

