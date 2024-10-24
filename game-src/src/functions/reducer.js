import { calculatePayment, calculateRunningCost } from "./utils";

export default (state, { type, payload }) => {
  switch (type) {
    case "buy-upgrade":
      return {
        ...state,
        [payload.effect.toChange]: payload.effect.value,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload.cost,
          upgrades: [...state.playerStats.upgrades, payload],
        },
      };
    case "buy-plant":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload.cost,
          plants: [...state.playerStats.plants, payload],
          output: state.playerStats.output + payload.output,
          co2: state.playerStats.co2 + payload.co2,
        },
      };
    case "sell-plant":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money + payload.cost * 0.5,
          plants: state.playerStats.plants.filter(plant => plant.id !== payload.id),
          output: state.playerStats.output - payload.output,
          co2: state.playerStats.co2 - payload.co2,
        },
      };
    case "upgrade-house":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          demand: state.playerStats.demand + 10,
          money: state.playerStats.money - 1000,
        },
        houseCount: state.houseCount - 1,
        officeCount: state.officeCount + 1,
      };
    case "get-paid": {
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money:
            state.playerStats.money +
            calculatePayment(
              state.houseCount,
              state.officeCount,
              state.payModifier,
              state.playerStats.output / state.playerStats.demand
            ),
        },
      };
    }
    case "pay-running-cost":
      console.log(state.playerStats.plants, state.costModifier)
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - 
          calculateRunningCost(state.playerStats.plants, state.costModifier),
        },
      };
    case "grow-population": 
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          demand: state.playerStats.demand + payload,
        },
      };

    case "debug-unlock":
      return {
        ...state,
        availablePlants: Array(100).fill(null).map((_, i) => i),
        availableUpgrades: Array(100).fill(null).map((_, i) => i),
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money + 999999,
        },
      };
    default:
      return state;
  }
};
