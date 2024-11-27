/**
 * Function that gets a random integer between 2 numbers, inclusive
 * @param {number} min - the minimum in the number range
 * @param {number} max - the maximum in the number range
 * @returns {number} - a random integer number
 */
export function randint(min, max) {
  return Math.floor(Math.random() * (Math.ceil(max) - Math.floor(min) + 1) + Math.ceil(min));
}

export function getRandomNums(n, from, to) {
  let arr;
  do {
    arr = Array.from({ length: n }, () => randint(from, to));
  } while (new Set(arr).size !== arr.length);
  return arr;
}

// paytable is array of pairs (property count, property pay per unit)
export function calculatePayment(payTable, modifier, demandFulfilledPercent) {
  const total = payTable.reduce((acc, [count, pay]) => acc + count * pay, 0);
  demandFulfilledPercent = Math.min(1, demandFulfilledPercent);
  return Math.floor(total * modifier * demandFulfilledPercent);
}

export function calculateRunningCost(plants, modifier) {
  // console.log(modifier)
  return Math.floor(plants.reduce((acc, plant) => acc + plant.runningCost, 0) * modifier);
}

export function setAdjacentCellsPower(pos, grid, bool) {
  if (bool) {
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (grid[pos[0] + i] && grid[pos[0] + i][pos[1] + j]) {
          grid[pos[0] + i][pos[1] + j].hasPower = bool;
        }
      }
    }
  } else {
    // for turning off, check all cells 2 away from the cell
    // and for each cell, also check 2 away from that to see if there is a power plant
    // that is, typeof .value is object, if so, don't turn off
    // use 4 loops
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (grid[pos[0] + i] && grid[pos[0] + i][pos[1] + j]) {
          let hasPower = false;
          for (let k = -2; k <= 2; k++) {
            for (let l = -2; l <= 2; l++) {
              if (grid[pos[0] + i + k] && grid[pos[0] + i + k][pos[1] + j + l]) {
                if (
                  grid[pos[0] + i + k][pos[1] + j + l].value != null &&
                  typeof grid[pos[0] + i + k][pos[1] + j + l].value === "object"
                ) {
                  hasPower = true;
                }
              }
            }
          }
          if (!hasPower) {
            grid[pos[0] + i][pos[1] + j].hasPower = bool;
          }
        }
      }
    }
  }
}

/**
 * Function that gets a boolean by a percentage chance
 * @param {number} percent - a percentage number betweeen 1 - 100
 * @returns {boolean} - a true/false selected based on the percentage
 */
export function chanceToBoolean(percent) {
  return Math.random() * 100 <= percent;
}

/**
 * Function to use inside an async block that can pause the execution for a set amount of seconds
 * @param {number} s - number of seconds to wait before next execution
 * @returns {Promise<any>} - a promise that resolves after s seconds
 */
export function delaySeconds(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}
