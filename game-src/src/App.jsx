import { useReducer, useState, useEffect } from "react";
import { Steps } from "intro.js-react";

import "./Styles/App.css";
import "./Styles/panels.css";
import "./Styles/mainScreen.css";
import "intro.js/introjs.css";

import Info from "./Components/Info";
import Grid from "./Components/Grid";
import Upgrades from "./Components/Upgrades";

import plants from "./data/plants.json";
import properties from "./data/properties.json";
import upgrades from "./data/upgrades.json";
import allMaps from "./data/maps.json";
import messages from "./data/message.json";
import guide from "./data/guide.json";
import music from "./data/sound.json";

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
    payIntervalModifier: 1,
    co2Modifier: 1,
    // ===
    availablePlants: [1], // stores ids of unlocked
    availableUpgrades: [1],
    runningCostInterval: 29,
    payInterval: 19,
    demandGrowInterval: 37,
    co2Limit: 120,
    gameStatus: "on", // on, won. lost
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

  const [DAY_INTERVAL, setDAY_INTERVAL] = useState(1.5 * 10000);

  const [showProfitWindow, setShowProfitWindow] = useState(false);
  const [showRunningCostWindow, setShowRunningCostWindow] = useState(false);
  const [showPopulationChangeWindow, setShowPopulationChangeWindow] = useState(false);
  const [days, setDays] = useState(1);
  const [demandGrowthAmount, setDemandGrowthAmount] = useState(10);

  const [paymentInfo, setPaymentInfo] = useState({ money: 0, counts: {}, demandPercent: 0 });
  const [runningCostInfo, setRunningCostInfo] = useState({ money: 0, cnt: 0 });

  const [showTutorial, setShowTutorial] = useState([false, false, false]);
  const [tutorialShowed, setTutorialShowed] = useState([true, false, false]);

  let currentTrackIdx = 0;

  useEffect(() => {
    setShowTutorial([true, false, false]);
    // cheats
    window.giveMeAllThings = () => dispatch({ type: "debug-unlock" });
    window.giveMeMoney = (amount = 1) => dispatch({ type: "get-paid", payload: amount });
    window.giveMeSpeed = (spd) => setDAY_INTERVAL(spd);
    window.giveMeTheEnd = (winOrLose) => dispatch({ type: "debug-endgame", payload: winOrLose });
  }, []);

  // progress days
  useEffect(() => {
    if (
      showProfitWindow ||
      showRunningCostWindow ||
      showPopulationChangeWindow ||
      state.gameStatus !== "on" ||
      showTutorial.includes(true) ||
      DAY_INTERVAL > 100
    )
      return;
    const intervalId = setInterval(() => {
      setDays(n => n + 1);
    }, 1000 * DAY_INTERVAL);
    return () => {
      clearInterval(intervalId);
    };
  }, [
    showProfitWindow,
    showRunningCostWindow,
    showPopulationChangeWindow,
    DAY_INTERVAL,
    state.gameStatus,
    showTutorial,
  ]);

  // === Periodic Events ===
  // payment
  useEffect(() => {
    // only show when started producing power
    // and pause timer when the popup is being shown
    if (days === 0 || state.playerStats.output === 0) return;

    if (days % Math.floor(state.payInterval * state.payIntervalModifier) === 0) {
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
        (state.playerStats.output * state.outputModifier) / state.playerStats.demand
      );
      const payInfo = {
        money: calculatedPayment || 0,
        counts: {},
        demandPercent: Math.floor(
          ((state.playerStats.output * state.outputModifier) / state.playerStats.demand) * 100
        ),
      };
      for (const prop of properties) {
        payInfo.counts[prop.name] = propertiesCntMap[prop.name] || 0;
      }
      setPaymentInfo(payInfo);
      dispatch({ type: "get-paid", payload: calculatedPayment });
      setShowProfitWindow(true);

      // show the second tutorial if not showeed
      if (!tutorialShowed[1]) {
        setShowTutorial([false, true, false]);
        setTutorialShowed(pre => [pre[0], true, pre[2]]);
      }
    }
  }, [days, state.output, state.payIntervalModifier]);

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
    if (days === 0 || days % state.demandGrowInterval !== 0 || paymentInfo.money === 0) return;

    // decreasing will run even if demand is not met
    if (demandGrowthAmount < 0) {
      dispatch({ type: "grow-population", payload: demandGrowthAmount });
      setShowPopulationChangeWindow(true);
      return;
    }

    // only run when demand is met, to grow population
    if (state.playerStats.output * state.outputModifier >= state.playerStats.demand * 0.75) {
      setShowPopulationChangeWindow(true);
      dispatch({ type: "grow-population", payload: demandGrowthAmount });
    }

    // show the third tutorial if not showed
    if (!tutorialShowed[2]) {
      setShowTutorial([false, false, true]);
      setTutorialShowed(pre => [pre[0], pre[1], true]);
    }
  }, [days, state.demandGrowInterval, paymentInfo]);

  // set the growth amount in the next grow event
  useEffect(() => {
    if (state.playerStats.co2 * state.co2Modifier > state.co2Limit) {
      setDemandGrowthAmount(-10);
    }
    else {
      setDemandGrowthAmount(10);
    }
  }, [state.co2Limit, state.playerStats.co2, state.co2Modifier]);

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

  if (state.gameStatus === "lost") {
    return (
      <div className="game-over">
        <h1>You Lost</h1>
        <h3>Days: {days}</h3>
        <h3>Money: ${state.playerStats.money}</h3>
        <button onClick={() => window.location.reload()}>Restart</button>
        <img src="/assets/game_lost.jpg" alt="" />
      </div>
    );
  }
  if (state.gameStatus === "won") {
    return (
      <div className="game-over">
        <h1>Congratulations!</h1>
        <h3>Days: {days}</h3>
        <h3>Money: ${state.playerStats.money}</h3>
        <button onClick={() => window.location.reload()}>Restart</button>
        <button onClick={() => dispatch({ type: "continue" })}>Continue</button>
        <img src="/assets/game_win.jpg" alt="" />
      </div>
    );
  }

  return (
    <>
      <Steps
        enabled={showTutorial[0]}
        steps={guide.intro}
        initialStep={0}
        onExit={() => {
          setShowTutorial([false, false, false]);
          setDAY_INTERVAL(1.5);
          // audio needs to be put here since the user need to interact with the page first
          const audio = new Audio(music[currentTrackIdx]);
          audio.onended = () => {
            audio.src = music[++currentTrackIdx % music.length];
            audio.play();
          };
          audio.volume = 0.1;
          audio.play().catch(e => console.log("didn't play sound", e));
        }}
        options={{ hideNext: false }}
      />
      <Steps
        enabled={showTutorial[1]}
        steps={guide.pay}
        initialStep={0}
        onExit={() => {
          setShowTutorial([false, false, false]);
        }}
        options={{ hideNext: false }}
      />
      <Steps
        enabled={showTutorial[2]}
        steps={guide.grow}
        initialStep={0}
        onExit={() => {
          setShowTutorial([false, false, false]);
        }}
        options={{ hideNext: false }}
      />

      <Info
        playerStats={state.playerStats}
        co2Limit={state.co2Limit}
        days={days}
        setDAY_INTERVAL={setDAY_INTERVAL}
      />
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
  
      <PeriodicPopup
        shouldShow={showProfitWindow}
        title="Profit Summary"
        text={
          `You reiceved $${paymentInfo.money}. \n` +
          `Property Counts: \n` +
          properties.map(prop => `${prop.name}: ${paymentInfo.counts[prop.name] || 0}`).join("\n") +
          `\n\n` +
          `Demand Fulfilled: ${paymentInfo.demandPercent}% \n`
        }
        dialogue={{
          title: "Crazy Steve",
          text: messages.pay[randint(0, messages.pay.length - 1)],
          img: "/assets/crazy.png",
        }}
        closeFunc={() => setShowProfitWindow(false)}
      />
      <PeriodicPopup
        shouldShow={showRunningCostWindow}
        title="Running Cost Summary"
        text={`You paid $${runningCostInfo.money} for maintenance and resources needed to power your ${runningCostInfo.cnt} facilities.`}
        closeFunc={() => setShowRunningCostWindow(false)}
      />
      {(() => {
        const shouldDisaster =
          chanceToBoolean(50) && (state.playerStats.co2 - state.co2Limit) / state.co2Limit > 0.2;
        const isDeclining = demandGrowthAmount < 0;

        return (
          <>
            <PeriodicPopup
              shouldShow={showPopulationChangeWindow && isDeclining && shouldDisaster}
              title="Natural Disaster"
              text={
                [
                  "A wildfire has started in the city! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                  "The city has been hit by a flood! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                  "An tornado has struck the city! Population has decreased by 30 people. To repair the damages, you paid $1000.",
                ][randint(0, 2)]
              }
              dialogue={{
                title: "Crazy Steve",
                text: messages.co2[randint(0, messages.co2.length - 1)],
                img: "/assets/crazy.png",
              }}
              closeFunc={() => {
                dispatch({ type: "grow-population", payload: -20 });
                dispatch({ type: "pay-running-cost", payload: 1000 });
                setShowPopulationChangeWindow(false);
              }}
            />
            <PeriodicPopup
              shouldShow={showPopulationChangeWindow && isDeclining && !shouldDisaster}
              title="Population decline"
              text={`Due to high CO2 emissions, population has decreased by 10 people!`}
              dialogue={{
                title: "Crazy Steve",
                text: messages.co2[randint(0, messages.co2.length - 1)],
                img: "/assets/crazy.png",
              }}
              closeFunc={() => setShowPopulationChangeWindow(false)}
            />
            <PeriodicPopup
              shouldShow={showPopulationChangeWindow && !isDeclining}
              title="Population Growth"
              text="Because of your excellent power services, population has increased by 10 people!"
              closeFunc={() => setShowPopulationChangeWindow(false)}
            />
          </>
        );
      })()}
      {/* <button onClick={() => dispatch({ type: "debug-unlock" })}>unlock</button> */}
    </>
  );
}

export default App;

