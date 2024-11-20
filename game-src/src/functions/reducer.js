function getNewState(state, { type, payload }) {
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
    case "buy-prop":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload.cost,
          demand: state.playerStats.demand + payload.demand,
        },
      };
    
    case "unlock-tile":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload,
        }
      }
    
      // periodic events
    case "get-paid": {
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money:
            state.playerStats.money + payload,
        },
      };
    }
    case "pay-running-cost":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload,
        },
      };
    case "grow-population": {
      const demandAdd = payload < 0 ? 0 : Math.floor(payload / 2);
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          demand: state.playerStats.demand + demandAdd,
          population: state.playerStats.population + payload,
        },
      };
    }

    // unlocks
    case "unlock-plant":
      return {
        ...state,
        availablePlants: state.availablePlants.concat(state.availablePlants.length + 1),
      };
    case "unlock-upgrade":
      return {
        ...state,
        availableUpgrades: state.availableUpgrades.concat(state.availableUpgrades.length + 1),
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
}

export default (state, { type, payload }) => {
  const newState = getNewState(state, { type, payload });
  if (newState.playerStats.population <= 0 || newState.playerStats.money <= -5000) {
    return {
      ...newState,
      playerStats: {
        ...newState.playerStats,
      },
      gameOver: true,
    };
  }
  return newState;
};

