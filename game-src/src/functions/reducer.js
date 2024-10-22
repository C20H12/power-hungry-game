export default (state, { type, payload }) => {
  switch (type) {

    case "buy-upgrade":
      return {
        ...state,
        [payload.effect.toChange]: payload.effect.value,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload.cost,
          upgrades: [...state.playerStats.upgrades, payload]
        }
      }
    case "buy-plant":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - payload.cost,
          plants: [...state.playerStats.plants, payload]
        }
      }
    case "sell-plant":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money + payload.cost * 0.5,
          plants: state.playerStats.plants.filter(plant => plant.id !== payload.id)
        }
      }
    case "upgrade-house":
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          money: state.playerStats.money - 1000,
          houseCount: state.houseCount - 1,
          officeCount: state.officeCount + 1
        }
      }

    default:
      return state
  }
}
