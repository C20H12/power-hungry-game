/**
 * Function that gets a random integer between 2 numbers, inclusive
 * @param {number} min - the minimum in the number range
 * @param {number} max - the maximum in the number range
 * @returns {number} - a random integer number
 */
export function randint(min, max) {
  return Math.floor(
    Math.random() * (Math.ceil(max) - Math.floor(min) + 1) + Math.ceil(min)
  );
}

export function getRandomNums(n, from, to){
  let arr;
  do {
    arr = Array.from({ length: n }, () => randint(from, to));
  } while (new Set(arr).size !== arr.length)
  return arr;
};

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
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (grid[pos[0] + i] && grid[pos[0] + i][pos[1] + j]) {
        grid[pos[0] + i][pos[1] + j].hasPower = bool;
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
  return new Promise(resolve => setTimeout(resolve, s*1000));
}