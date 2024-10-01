const plants_data = {
  "Coal Power Plant": {
    "type": "Fossil Fuel",
    "cost": 500000,
    "power": 600,
    "pollution": 1500000,
    "maintenance_cost": 20000,
    "build_time": 24,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cofrentes_nuclear_power_plant_cooling_towers_retouched.jpg"
  },
  "Nuclear Power Plant": {
    "type": "Nuclear",
    "cost": 2000000,
    "power": 1200,
    "pollution": 0,
    "maintenance_cost": 100000,
    "build_time": 48,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cofrentes_nuclear_power_plant_cooling_towers_retouched.jpg"
  },
  "Solar Farm": {
    "type": "Renewable",
    "cost": 300000,
    "power": 100,
    "pollution": 0,
    "maintenance_cost": 5000,
    "build_time": 6,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cofrentes_nuclear_power_plant_cooling_towers_retouched.jpg"
  },
  "Wind Farm": {
    "type": "Renewable",
    "cost": 400000,
    "power": 150,
    "pollution": 0,
    "maintenance_cost": 7000,
    "build_time": 8,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cofrentes_nuclear_power_plant_cooling_towers_retouched.jpg"
  },
  "Hydroelectric Dam": {
    "type": "Renewable",
    "cost": 1500000,
    "power": 800,
    "pollution": 0,
    "maintenance_cost": 30000,
    "build_time": 36,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/03/Cofrentes_nuclear_power_plant_cooling_towers_retouched.jpg"
  }
}

const gridContainer = document.getElementById('grid-container');
const modal = document.getElementById('modal');
const modalContent = modal.firstElementChild;


// Create 10x10 grid dynamically
for (let i = 0; i < 100; i++) {
  const gridItem = document.createElement('div');
  gridItem.classList.add('grid-item');
  gridItem.dataset.id = i;
  gridItem.addEventListener('click', e => openModal(e, i));
  gridContainer.appendChild(gridItem);
}

const gameState = {
  player_money: 2*3000001-1,
  player_pollution: 0,
  player_power: 0,
  gridState: [...Array(100)],
  plants_data: plants_data
};

// Open modal function
function openModal(e, id) {
  modal.style.display = 'block';
  // position the menu
  modalContent.style.left = e.pageX + "px";
  modalContent.style.top = e.pageY + "px";

  const blockState = gameState.gridState[id];
  if (blockState == undefined) {
    Object.keys(gameState.plants_data).forEach(k => {
      const btn = document.createElement("button");
      btn.innerText = `Build ${k}`;
      btn.addEventListener("click", () => build(id, k))
      if (gameState.plants_data[k].cost < gameState.player_money) {
        modalContent.appendChild(btn);
      }
    });
  }
  else {
    Object.keys(gameState.plants_data[blockState]).forEach(k => {
      if (k != "image") {
        const p = document.createElement("p");
        p.innerText = k + ":" + gameState.plants_data[blockState][k];
        modalContent.appendChild(p);
      }
    });
  }
}
function closeModal() {
  modal.style.display = 'none';
  modalContent.innerHTML = "";
}

// Close modal if clicked outside of the content
window.addEventListener("click", e => {
  if (e.target === modal) {
    closeModal()
  }
})

function build(sqrId, thing) {
  gameState.player_money -= gameState.plants_data[thing].cost;
  gameState.player_pollution += gameState.plants_data[thing].pollution;
  gameState.player_power += gameState.plants_data[thing].power;
  gameState.gridState[sqrId] = thing;
  document.querySelector(`div[data-id="${sqrId}"]`).style.backgroundImage = `url(${gameState.plants_data[thing].image})`
  update();
  closeModal();
}

function update() {
  document.querySelectorAll(".stats span").forEach(item => {
    item.innerHTML = gameState[item.dataset.disp];
  })
}
update()