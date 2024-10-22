import { useReducer } from "react";

import "./Styles/App.css";
import "./Styles/panels.css";

import Info from "./Components/Info";
import Grid from "./Components/Grid";
import Upgrades from "./Components/Upgrades";

import plants from "./data/plants.json";
import upgrades from "./data/upgrades.json";

import reducer from "./functions/reducer";

function App() {
  const initialWorld = {
    playerStats: {
      money: 10000000,
      output: 10,
      demand: 10,
      co2: 222,
      upgrades: [], // stores objects
      plants: [],
    },
    costModifier: 1,
    payModifier: 1,
    outputModifier: 1,
    co2Modifier: 1,
    availablePlants: [1, 4], // stores ids of unlocked
    availableUpgrades: [1, 2, 3, 4, 5, 6, 7, 8],
    runningCostInterval: 30,
    payInterval: 60,
    demandGrowInterval: 100,
    co2Limit: 300,
    houseCount: 10,
    officeCount: 0,
  };

  const [state, dispatch] = useReducer(reducer, initialWorld);

  // useEffect(() => {

  // }, [])

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
        playerPlants={state.playerStats.plants}
        money={state.playerStats.money}
        buyPlantHandler={payload => dispatch({ type: "buy-plant", payload })}
        sellPlantHandler={payload => dispatch({ type: "sell-plant", payload })}
        upgradeHouseHandler={() => dispatch({ type: "upgrade-house" })}
      />
    </>
  );
}

export default App;

