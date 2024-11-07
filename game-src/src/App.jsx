import { useReducer, useState, useEffect } from "react";

import "./Styles/App.css";
import "./Styles/panels.css";

import Info from "./Components/Info";
import Grid from "./Components/Grid";
import Upgrades from "./Components/Upgrades";

import plants from "./data/plants.json";
import upgrades from "./data/upgrades.json";
import allMaps from "./data/maps.json";

import reducer from "./functions/reducer";
import PeriodicPopup from "./Components/PeriodicPopup";
import { calculatePayment, calculateRunningCost, randint } from "./functions/utils";

function App() {
  const initialWorld = {
    playerStats: {
      money: 2000,
      population: 100,
      output: 0,
      demand: 10,
      co2: 0,
      upgrades: [], // stores objects
      plants: [],
    },
    costModifier: 1, // running cost multiplier
    payModifier: 1, // pay out
    outputModifier: 1,
    co2Modifier: 1,
    availablePlants: [1], // stores ids of unlocked
    availableUpgrades: [1],
    runningCostInterval: 20,
    payInterval: 3,
    demandGrowInterval: 15,
    co2Limit: 100,
  };

  const [state, dispatch] = useReducer(reducer, initialWorld);

  // initialize grid state using the random maps in maps.json
  const [gridState, setGridState] = useState(() => {
    const pickedMap = allMaps[randint(0, allMaps.length - 1)];
    const grid = [];
    for (let index = 0; index < 10; index++) {
      grid.push(
        Array(10)
          .fill(null)
          .map((_, i) => {
            return {
              value: null,
              bg: pickedMap[index][i],
              locked: true,
              hasPower: false
            };
          })
      );
    }
    grid[0][0].locked = false;
    grid[0][1].locked = false;
    grid[1][0].locked = false;
    grid[1][1].locked = false;
    grid[1][1].value = "house";
    return grid;
  });

  const [DAY_INTERVAL, setDAY_INTERVAL] = useState(999);

  const [showProfitWindow, setShowProfitWindow] = useState(false);
  const [showRunningCostWindow, setShowRunningCostWindow] = useState(false);
  const [showPopulationChangeWindow, setShowPopulationChangeWindow] = useState(false);
  const [days, setDays] = useState(1);
  const [demandGrowthAmount, setDemandGrowthAmount] = useState(10);

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [runningCostInfo, setRunningCostInfo] = useState(null);

  useEffect(() => {
    if (showProfitWindow || showRunningCostWindow || showPopulationChangeWindow) return;
    const intervalId = setInterval(() => {
      setDays(n => n + 1);
    }, 1000 * DAY_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [showProfitWindow, showRunningCostWindow, showPopulationChangeWindow, DAY_INTERVAL]);

  useEffect(() => {
    // only show when started producing power
    // and pause timer when the popup is being shown
    if (days === 0 || state.playerStats.output === 0) return;

    if (days % state.payInterval === 0) {
      const propertiesCntMap = {}
      gridState.forEach(row => {
        row.forEach(cell => {
          if (typeof cell.value === "string" && cell.hasPower) {
            propertiesCntMap[cell.value] = (propertiesCntMap[cell.value] || 0) + 1;
          }
        });
      })
      const calculatedPayment = calculatePayment(
        [
          [propertiesCntMap["house"] || 0, 100],
          [propertiesCntMap["office"] || 0, 200],
          [propertiesCntMap["shop"] || 0, 300],
          [propertiesCntMap["bank"] || 0, 500],
          [propertiesCntMap["factory"] || 0, 1000],
        ],
        state.payModifier,
        state.playerStats.output / state.playerStats.demand
      );
      setPaymentInfo({
        money: calculatedPayment || 0,
        houseCount: propertiesCntMap["house"] || 0,
        officeCount: propertiesCntMap["office"] || 0,
        shopCount: propertiesCntMap["shop"] || 0,
        bankCount: propertiesCntMap["bank"] || 0,
        factoryCount: propertiesCntMap["factory"] || 0,
        demandPercent: Math.floor(state.playerStats.output / state.playerStats.demand * 100)
      })
      dispatch({ type: "get-paid", payload: calculatedPayment });
      setShowProfitWindow(true);
    }
  }, [days, state.output, state.payInterval]);

  useEffect(() => {
    if (days === 0 || state.playerStats.plants.length === 0) return;

    if (state.playerStats.money < calculateRunningCost(state.playerStats.plants, state.costModifier)) {
      dispatch({ type: "game-over" }); // TODO: implement this
      return;
    }
    
    const calculatedCost = calculateRunningCost(state.playerStats.plants, state.costModifier);
    if (days % state.runningCostInterval === 0) {
      setRunningCostInfo({
        money: calculatedCost,
        cnt: state.playerStats.plants.length
      })
      dispatch({ type: "pay-running-cost", payload: calculatedCost });
      setShowRunningCostWindow(true);
    }
  }, [days, state.playerStats.plants, state.runningCostInterval]);

  useEffect(() => {
    if (
      days === 0 ||
      days % state.demandGrowInterval !== 0
    )
      return;

    // decreasing will run even if demand is not met
    if (demandGrowthAmount < 0) {
      dispatch({ type: "grow-population", payload: demandGrowthAmount });
      setShowPopulationChangeWindow(true);
      if (state.playerStats.population < 0) {
        dispatch({ type: "game-over" }); // TODO: implement this
      }
      return;
    }
      
    // only run when demand is met, to grow population
    if (state.playerStats.output >= state.playerStats.demand) {
      setShowPopulationChangeWindow(true);
      dispatch({ type: "grow-population", payload: demandGrowthAmount });
    }

  }, [days, state.demandGrowInterval]);

  // set the growth amount in the next grow event
  useEffect(() => {
    if (state.playerStats.co2 >= state.co2Limit) {
      setDemandGrowthAmount(-10);
    }
  }, [state.co2Limit, state.playerStats.co2]);


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
        upgradeHouseHandler={addOneOrNone => dispatch({ type: "upgrade-house", payload: addOneOrNone })}
        unlockTileHandler={payload => dispatch({ type: "unlock-tile", payload})}
        setGridState={setGridState}
      />
      {showProfitWindow && (
        <PeriodicPopup
          title="Profit Summary"
          text={
            `You reiceved $${paymentInfo.money}. \n` +
            `Houses count: ${paymentInfo.houseCount} \n` +
            `Offices count: ${paymentInfo.officeCount} \n` +
            `Shops count: ${paymentInfo.shopCount} \n` +
            `Banks count: ${paymentInfo.bankCount} \n` +
            `Factories count: ${paymentInfo.factoryCount} \n` +
            `Demand Fulfilled: ${paymentInfo.demandPercent}% \n`
          }
          closeFunc={() => setShowProfitWindow(false)}
        />
      )}
      {showRunningCostWindow && (
        <PeriodicPopup
          title="Running Cost Summary"
          text={`You paid $${runningCostInfo.money} for maintenance and resources needed to power your ${runningCostInfo.cnt} facilities.`}
          closeFunc={() => setShowRunningCostWindow(false)}
        />
      )}
      {showPopulationChangeWindow && (
        <PeriodicPopup
          title="Population Change"
          text={
            demandGrowthAmount > 0
              ? `Because of your excellent power services, population has increased by 10 people!`
              : `Due to high CO2 emissions, population has decreased by 10 people!`
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
        music2
      </button>
      <button onClick={() => setDAY_INTERVAL(0.5)}>
        fast
      </button>
      <button onClick={() => setDAY_INTERVAL(2)}>
        slow
      </button>
      <button onClick={() => setDAY_INTERVAL(1000)}>
        stop
      </button>
    </>
  );
}

export default App;

