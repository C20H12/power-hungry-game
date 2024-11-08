import { useReducer, useState, useEffect } from "react";

import "./Styles/App.css";
import "./Styles/panels.css";

import Info from "./Components/Info";
import Grid from "./Components/Grid";
import Upgrades from "./Components/Upgrades";

import plants from "./data/plants.json";
import properties from "./data/properties.json";
import upgrades from "./data/upgrades.json";
import allMaps from "./data/maps.json";
import messages from "./data/message.json";

import reducer from "./functions/reducer";
import PeriodicPopup from "./Components/PeriodicPopup";
import { calculatePayment, calculateRunningCost, chanceToBoolean, randint } from "./functions/utils";

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
    runningCostInterval: 999,
    payInterval: 3222,
    demandGrowInterval: 2,
    co2Limit: 100,
    gameOver: false,
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
              hasPower: false,
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

  const [paymentInfo, setPaymentInfo] = useState({ money: 0, counts: {}, demandPercent: 0 });
  const [runningCostInfo, setRunningCostInfo] = useState({ money: 0, cnt: 0 });

  // progress days
  useEffect(() => {
    if (showProfitWindow || showRunningCostWindow || showPopulationChangeWindow || state.gameOver) return;
    const intervalId = setInterval(() => {
      setDays(n => n + 1);
    }, 1000 * DAY_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [showProfitWindow, showRunningCostWindow, showPopulationChangeWindow, DAY_INTERVAL, state.gameOver]);

  // === Periodic Events ===
  // payment
  useEffect(() => {
    // only show when started producing power
    // and pause timer when the popup is being shown
    if (days === 0 || state.playerStats.output === 0) return;

    if (days % state.payInterval === 0) {
      const propertiesCntMap = {};
      gridState.forEach(row => {
        row.forEach(cell => {
          if (typeof cell.value === "string" && cell.hasPower) {
            propertiesCntMap[cell.value] = (propertiesCntMap[cell.value] || 0) + 1;
          }
        });
      });
      const calculatedPayment = calculatePayment(
        properties.map(prop => [propertiesCntMap[prop.name] || 0, prop.payout]),
        state.payModifier,
        state.playerStats.output / state.playerStats.demand
      );
      const payInfo = {
        money: calculatedPayment || 0,
        counts: {},
        demandPercent: Math.floor((state.playerStats.output / state.playerStats.demand) * 100),
      };
      for (const prop of properties) {
        payInfo.counts[prop.name] = propertiesCntMap[prop.name] || 0;
      }
      setPaymentInfo(payInfo);
      dispatch({ type: "get-paid", payload: calculatedPayment });
      setShowProfitWindow(true);
    }
  }, [days, state.output, state.payInterval]);

  // running cost
  useEffect(() => {
    if (days === 0 || state.playerStats.plants.length === 0) return;

    const calculatedCost = calculateRunningCost(state.playerStats.plants, state.costModifier);
    if (days % state.runningCostInterval === 0) {
      setRunningCostInfo({
        money: calculatedCost,
        cnt: state.playerStats.plants.length,
      });
      dispatch({ type: "pay-running-cost", payload: calculatedCost });
      setShowRunningCostWindow(true);
    }
  }, [days, state.playerStats.plants, state.runningCostInterval]);

  // grow population
  useEffect(() => {
    if (days === 0 || days % state.demandGrowInterval !== 0) return;

    // decreasing will run even if demand is not met
    if (demandGrowthAmount < 0) {
      dispatch({ type: "grow-population", payload: demandGrowthAmount });
      setShowPopulationChangeWindow(true);
      return;
    }

    // only run when demand is met, to grow population
    if (state.playerStats.output >= state.playerStats.demand * 0.75) {
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

  // unlocks
  useEffect(() => {
    if (state.availablePlants.length < plants.length) {
      // unlock every 40 population growth
      if (state.playerStats.population % 40 === 0) {
        // id 17 18 should not be unlocked until advanced upgrade
        if (state.availablePlants.length < 17) {
          dispatch({ type: "unlock-plant" });
        } else {
          // if advanced upgrade is unlocked, unlock the last 2 plants
          if (state.playerStats.upgrades.map(up => up.name).includes("Advanced")) {
            dispatch({ type: "unlock-plant" });
          }
        }
      }
      // unlock upgrade every 50 population growth
      if (state.playerStats.population % 60 === 0) {
        dispatch({ type: "unlock-upgrade" });
      }
    }
  }, [state.playerStats.population]);

  if (state.gameOver) {
    return (
      <div className="game-over">
        <h1>Game Over</h1>
        <h3>Days: {days}</h3>
        <h3>Money: ${state.playerStats.money}</h3>
      </div>
    );
  }

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
        allProperties={properties}
        money={state.playerStats.money}
        gridState={gridState}
        buyPlantHandler={payload => dispatch({ type: "buy-plant", payload })}
        sellPlantHandler={payload => dispatch({ type: "sell-plant", payload })}
        buyPropertyHandler={payload => dispatch({ type: "buy-prop", payload })}
        unlockTileHandler={payload => dispatch({ type: "unlock-tile", payload })}
        setGridState={setGridState}
      />
      {showProfitWindow && (
        <PeriodicPopup
          title="Profit Summary"
          text={
            `You reiceved $${paymentInfo.money}. \n` +
            `Property Counts: \n` +
            properties.map(prop => `${prop.name}: ${paymentInfo.counts[prop.name] || 0}`).join("\n") +
            `\n\n` +
            `Demand Fulfilled: ${paymentInfo.demandPercent}% \n`
          }
          dialogue={{
            text: messages.pay[randint(0, messages.pay.length - 1)],
            img: "/assets/crazy.png",
          }}
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
      {showPopulationChangeWindow &&
        // by chance, if co2 too much, ie demand grow < 0, show the disaster event popup
        (demandGrowthAmount < 0 ? (
          chanceToBoolean(50) && (state.playerStats.co2 - state.co2Limit) / state.co2Limit > 0.2 ? (
            <PeriodicPopup
              title="Natural Disaster"
              text={
                [
                  "A wildfire has started in the city! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                  "The city has been hit by a flood! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                  "An tornado has struck the city! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                ][randint(0, 2)]
              }
              dialogue={{
                text: messages.co2[randint(0, messages.co2.length - 1)],
                img: "/assets/crazy.png",
              }}
              closeFunc={() => {
                dispatch({ type: "grow-population", payload: -20 });
                dispatch({ type: "pay-running-cost", payload: 1000 });
                setShowPopulationChangeWindow(false);
              }}
            />
          ) : (
            <PeriodicPopup
              title="Population decline"
              text={`Due to high CO2 emissions, population has decreased by 10 people!`}
              dialogue={{
                text: messages.co2[randint(0, messages.co2.length - 1)],
                img: "/assets/crazy.png",
              }}
              closeFunc={() => setShowPopulationChangeWindow(false)}
            />
          )
        ) : (
          <PeriodicPopup
            title="Population Growth"
            text="Because of your excellent power services, population has increased by 10 people!"
            closeFunc={() => setShowPopulationChangeWindow(false)}
          />
        ))}
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
      <button onClick={() => setDAY_INTERVAL(0.5)}>fast</button>
      <button onClick={() => setDAY_INTERVAL(2)}>slow</button>
      <button onClick={() => setDAY_INTERVAL(1000)}>stop</button>
    </>
  );
}

export default App;

