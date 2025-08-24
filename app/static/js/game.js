// Space Truckers — Minimal Turn-Based Simulation
const fmt = (n) => n.toLocaleString('en-US')
const logEl = document.getElementById('log')
const ui = {
  day: document.getElementById('ui-day'),
  credits: document.getElementById('ui-credits'),
  fuelPrice: document.getElementById('ui-fuel-price'),
  rep: document.getElementById('ui-rep'),
  contracts: document.getElementById('contracts'),
  fleet: document.getElementById('fleet-list'),
  lb: document.getElementById('lb-list'),
}
const state = {
  day: 1,
  credits: 5000,
  rep: 0,
  fuelPrice: 4,
  fleet: [
    { id: 1, name: 'ST-101', fuel: 100, fuelMax: 100, hp: 100, hpMax: 100, cap: 30, busy: 0 }
  ],
  nextId: 2,
  contracts: [],
}

function log(msg) {
  const line = document.createElement('div')
  line.textContent = `Day ${state.day}: ${msg}`
  logEl.prepend(line)
}

// RNG helpers
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Galaxy data
const planets = ['Terra', 'Luna', 'Mars', 'Ganymede', 'Europa', 'Titan', 'Ceres', 'Vesta', 'Kepler-22b', 'Proxima-b']
function genContract() {
  const from = choice(planets)
  let to = choice(planets.filter(p => p !== from))
  const dist = rnd(20, 200) // ly units
  const weight = rnd(5, 40) // tons
  const deadline = state.day + rnd(2, 8)
  const base = dist * 8 + weight * 15
  const payout = Math.round(base * (1 + Math.random()))
  const penalty = Math.round(payout * 0.5)
  return { id: crypto.randomUUID(), from, to, dist, weight, deadline, payout, penalty }
}

function refreshContracts(n=5) {
  state.contracts = Array.from({length: n}, () => genContract())
  renderContracts()
}

function render() {
  ui.day.textContent = state.day
  ui.credits.textContent = fmt(state.credits)
  ui.fuelPrice.textContent = state.fuelPrice
  ui.rep.textContent = state.rep
  renderFleet()
  renderContracts()
  updateLeaderboard()
}

function renderFleet() {
  ui.fleet.innerHTML = ''
  state.fleet.forEach(ship => {
    const card = document.createElement('div')
    card.className = 'bg-neutral-800 rounded-xl p-3'
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="font-semibold">${ship.name}</div>
        <div class="text-xs">${ship.busy ? `Busy (${ship.busy}d)` : 'Idle'}</div>
      </div>
      <div class="text-xs mt-1">Fuel: ${ship.fuel}/${ship.fuelMax} | HP: ${ship.hp}/${ship.hpMax} | Cap: ${ship.cap}t</div>
    `
    ui.fleet.appendChild(card)
  })
}

function renderContracts() {
  ui.contracts.innerHTML = ''
  state.contracts.forEach(ct => {
    const box = document.createElement('div')
    box.className = 'bg-neutral-800 rounded-xl p-3'
    box.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="font-semibold">${ct.from} → ${ct.to}</div>
        <div class="text-xs">Deadline: D${ct.deadline}</div>
      </div>
      <div class="text-xs mt-1">Dist: ${ct.dist} | Weight: ${ct.weight}t | Payout: ${fmt(ct.payout)} | Penalty: ${fmt(ct.penalty)}</div>
      <div class="mt-2 flex gap-2">
        <button class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 accept">Assign</button>
      </div>
    `
    const btn = box.querySelector('.accept')
    btn.addEventListener('click', () => assignContract(ct))
    ui.contracts.appendChild(box)
  })
}

function assignContract(ct) {
  const idle = state.fleet.find(s => !s.busy && s.cap >= ct.weight)
  if (!idle) {
    log('No idle ship with enough capacity.')
    return
  }
  // cost to depart = fuel proportional to dist + weight
  const fuelNeeded = Math.ceil(ct.dist * 0.4 + ct.weight * 0.2)
  if (idle.fuel < fuelNeeded) {
    log(`${idle.name} lacks fuel (${fuelNeeded} needed).`)
    return
  }
  idle.fuel -= fuelNeeded
  idle.busy = Math.ceil(ct.dist / 30) // travel days
  idle._contract = ct
  log(`${idle.name} departed ${ct.from}→${ct.to} (ETA ${idle.busy}d).`)
}

function nextDay() {
  state.day += 1

  // Random drift of fuel price
  if (Math.random() < 0.4) {
    const delta = rnd(-1, 2)
    state.fuelPrice = Math.max(2, state.fuelPrice + delta)
  }

  // Progress missions
  for (const ship of state.fleet) {
    if (ship.busy) {
      ship.busy -= 1
      // Chance of breakdown
      if (Math.random() < 0.15) {
        const dmg = rnd(5, 20)
        ship.hp = Math.max(0, ship.hp - dmg)
        log(`${ship.name} suffered a breakdown (-${dmg} HP).`)
      }
      if (ship.busy === 0) {
        const ct = ship._contract
        ship._contract = null
        // Arrived — compute payout / penalty
        if (state.day <= ct.deadline) {
          state.credits += ct.payout
          state.rep += 1
          log(`${ship.name} delivered on time. +${fmt(ct.payout)} cr, +1 rep.`)
        } else {
          state.credits -= ct.penalty
          state.rep = Math.max(0, state.rep - 1)
          log(`${ship.name} delivered late. -${fmt(ct.penalty)} cr, -1 rep.`)
        }
      }
    }
  }

  render()
}

function refuelAll() {
  let spent = 0
  state.fleet.forEach(ship => {
    const need = ship.fuelMax - ship.fuel
    const can = Math.min(need, Math.floor(state.credits / state.fuelPrice))
    if (can > 0) {
      ship.fuel += can
      const cost = can * state.fuelPrice
      state.credits -= cost
      spent += cost
    }
  })
  log(`Refueled fleet for ${fmt(spent)} credits.`)
  render()
}

function repairAll() {
  let spent = 0
  state.fleet.forEach(ship => {
    const need = ship.hpMax - ship.hp
    const cost = need * 5
    if (need > 0 && state.credits >= cost) {
      ship.hp = ship.hpMax
      state.credits -= cost
      spent += cost
    }
  })
  log(`Repaired fleet for ${fmt(spent)} credits.`)
  render()
}

function buyShip() {
  const price = 2000
  if (state.credits < price) return log('Not enough credits.')
  state.credits -= price
  const newShip = {
    id: state.nextId++,
    name: `ST-${100 + state.nextId}`,
    fuel: 100, fuelMax: 100,
    hp: 100, hpMax: 100,
    cap: rnd(25, 40),
    busy: 0
  }
  state.fleet.push(newShip)
  log(`Bought new ship ${newShip.name} (cap ${newShip.cap}t).`)
  render()
}

function sellShip() {
  if (state.fleet.length <= 1) return log('Keep at least one ship!')
  const sold = state.fleet.pop()
  const price = 1200
  state.credits += price
  log(`Sold ${sold.name} for ${fmt(price)} credits.`)
  render()
}

async function submitScore() {
  const name = document.getElementById('player-name').value || 'Anonymous'
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, profit: state.credits})
  })
  const data = await res.json()
  renderLeaderboard(data.leaderboard)
}

async function updateLeaderboard() {
  const res = await fetch('/api/leaderboard')
  const data = await res.json()
  renderLeaderboard(data)
}

function renderLeaderboard(items) {
  ui.lb.innerHTML = ''
  items.slice(0, 10).forEach((e, i) => {
    const div = document.createElement('div')
    div.textContent = `${i+1}. ${e.name} — ${fmt(e.profit)}`
    ui.lb.appendChild(div)
  })
}

// Events
document.getElementById('next-day').addEventListener('click', nextDay)
document.getElementById('random-event').addEventListener('click', () => {
  const roll = Math.random()
  if (roll < 0.33) {
    const delta = rnd(2, 5)
    state.fuelPrice = Math.max(2, state.fuelPrice + delta)
    log(`Fuel price surge +${delta}.`)
  } else if (roll < 0.66) {
    const fine = rnd(100, 400)
    state.credits = Math.max(0, state.credits - fine)
    log(`Customs inspection fine -${fmt(fine)}.`)
  } else {
    const bonus = rnd(150, 500)
    state.credits += bonus
    log(`Lucky contract bonus +${fmt(bonus)}.`)
  }
  render()
})
document.getElementById('buy-ship').addEventListener('click', buyShip)
document.getElementById('sell-ship').addEventListener('click', sellShip)
document.getElementById('refuel').addEventListener('click', refuelAll)
document.getElementById('repair').addEventListener('click', repairAll)
document.getElementById('refresh-contracts').addEventListener('click', () => refreshContracts(5))
document.getElementById('submit-score').addEventListener('click', submitScore)

// Init
refreshContracts(5)
render()
log('Welcome, Dispatcher. Build your fortune by Day 30 and submit your score!')
