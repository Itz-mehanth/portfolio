// Skill Town layout: every position in the world comes from here, so the
// terrain, roads, buildings, trees, signs and the car all agree.
//
// One broad island with an irregular outline. Its flat top sits at GROUND_Y;
// gentle grassy mounds rise toward the back, where the wind turbines stand. A
// main road loops through the town, a central avenue crosses it through a small
// plaza, and two spurs lead out to the docks and a lookout. Each of the nine
// skill districts is a cluster of 2-4 buildings beside its stop on the loop.
import * as THREE from 'three'

export const GROUND_Y = 2.6
export const SEA_Y = 0
export const RX = 13
export const RZ = 8.8

export const DISTRICT_ORDER = ['languages', 'web', 'mobile', 'backend', 'database', 'arvr', 'uiux', 'tools', 'aiml']
export const DISTRICT_LABELS = {
  languages: 'LANGUAGES', web: 'WEB', mobile: 'MOBILE', backend: 'BACKEND', database: 'DATABASE',
  arvr: 'AR/VR', uiux: 'UI/UX', tools: 'TOOLS', aiml: 'AI/ML',
}

// ---------- outline ----------
// Radius multiplier around the coast (t = 0 is +x, t = pi/2 is +z, toward the camera).
export const outline = (t) =>
  1 + 0.085 * Math.sin(2 * t + 0.6) + 0.06 * Math.sin(3 * t + 2.1) + 0.04 * Math.sin(5 * t + 0.4) + 0.022 * Math.sin(9 * t + 1.7)

export function coastPoint(t, scale = 1) {
  const r = outline(t) * scale
  return [Math.cos(t) * RX * r, Math.sin(t) * RZ * r]
}

// 0 at the centre, 1 on the coast.
export function radiusIn(x, z) {
  const t = Math.atan2(z / RZ, x / RX)
  return Math.hypot(x / RX, z / RZ) / outline(t)
}

export const isOnIsland = (x, z) => radiusIn(x, z) < 0.97

// ---------- mounds (rolling ground toward the back) ----------
export const MOUNDS = [
  { x: -6.4, z: -5.6, r: 3.0, h: 0.95 },
  { x: 0.8, z: -6.3, r: 2.7, h: 0.75 },
  { x: 7.8, z: -5.2, r: 2.6, h: 0.85 },
  { x: -10.6, z: -2.0, r: 1.8, h: 0.45 },
]
export const moundHeight = (m, x, z) => {
  const d = Math.hypot(x - m.x, z - m.z) / m.r
  return d < 1 ? m.h * (1 - d * d) * (1 - d * d) : 0
}
export function heightAt(x, z) {
  let h = 0
  for (const m of MOUNDS) h += moundHeight(m, x, z)
  return GROUND_Y + h
}

// ---------- roads ----------
const LOOP_POINTS = [
  [-9.4, 0.6], [-7.4, 3.7], [-3.8, 5.0], [0.0, 4.3], [3.6, 5.3], [7.4, 3.9],
  [9.6, 0.8], [8.3, -2.0], [4.6, -2.5], [1.0, -1.8], [-2.6, -2.7], [-6.6, -2.4],
]
export const ROAD_Y = GROUND_Y + 0.03
const v3 = ([x, z]) => new THREE.Vector3(x, ROAD_Y, z)

export const LOOP = new THREE.CatmullRomCurve3(LOOP_POINTS.map(v3), true, 'catmullrom', 0.5)
export const PLAZA = { x: 0.5, z: 1.15, r: 1.35 }
export const ROADS = [
  { curve: LOOP, width: 1.15 },
  // Central avenue through the plaza, front of the loop to the back.
  { curve: new THREE.CatmullRomCurve3([[0.0, 4.3], [0.3, 2.6], [PLAZA.x, PLAZA.z], [0.8, -0.3], [1.0, -1.8]].map(v3)), width: 0.95 },
  // Spur out to the east dock.
  { curve: new THREE.CatmullRomCurve3([[7.4, 3.9], [8.7, 5.2], [9.6, 6.25]].map(v3)), width: 0.8 },
  // Spur to a west lookout.
  { curve: new THREE.CatmullRomCurve3([[-9.4, 0.6], [-11.1, 0.2], [-11.9, -0.4]].map(v3)), width: 0.8 },
]

// Each district sits at one stop of the loop (control point index).
const STOP_INDEX = { languages: 6, web: 5, mobile: 4, database: 2, tools: 1, uiux: 0, aiml: 11, arvr: 10, backend: 8 }
const LOOP_N = LOOP_POINTS.length
export const STOP_T = Object.fromEntries(DISTRICT_ORDER.map((id) => [id, STOP_INDEX[id] / LOOP_N]))
export const DISTRICT_ROAD_POINTS = Object.fromEntries(DISTRICT_ORDER.map((id) => [id, LOOP.getPoint(STOP_T[id])]))
export const SPAWN_POINT = DISTRICT_ROAD_POINTS.languages.clone()

// The car drives the loop between two stops, whichever way round is shorter.
export function pathBetween(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return null
  const t0 = STOP_T[fromId]
  let d = STOP_T[toId] - t0
  if (d > 0.5) d -= 1
  if (d < -0.5) d += 1
  const steps = Math.max(12, Math.ceil(Math.abs(d) * 220))
  const pts = Array.from({ length: steps + 1 }, (_, i) => LOOP.getPoint((((t0 + (d * i) / steps) % 1) + 1) % 1))
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

// Distance from (x, z) to the nearest road edge (negative = on a road).
const ROAD_SAMPLES = ROADS.flatMap(({ curve, width }) => curve.getSpacedPoints(140).map((p) => [p.x, p.z, width / 2]))
export function roadClearance(x, z) {
  let best = Infinity
  for (const [px, pz, half] of ROAD_SAMPLES) best = Math.min(best, Math.hypot(px - x, pz - z) - half)
  return Math.min(best, Math.hypot(PLAZA.x - x, PLAZA.z - z) - PLAZA.r)
}

// ---------- deterministic randomness ----------
export function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// ---------- waterfalls (coast angles) with a creek running to each ----------
export const WATERFALLS = [
  { t: Math.PI / 2 - 0.32, width: 0.95 },
  { t: Math.PI / 2 + 0.62, width: 0.8 },
  { t: 0.22, width: 0.7 },
  { t: Math.PI - 0.38, width: 0.75 },
].map((f) => {
  const [ex, ez] = coastPoint(f.t, 1.0)
  const [ix, iz] = coastPoint(f.t, 0.8)
  return { ...f, edge: [ex, ez], inner: [ix, iz] }
})
const creekClearance = (x, z) =>
  Math.min(...WATERFALLS.map(({ edge: [ex, ez], inner: [ix, iz] }) => {
    const vx = ex - ix
    const vz = ez - iz
    const k = Math.max(0, Math.min(1, ((x - ix) * vx + (z - iz) * vz) / (vx * vx + vz * vz)))
    return Math.hypot(x - (ix + vx * k), z - (iz + vz * k))
  }))

// ---------- buildings ----------
const WALLS = ['#f7ecd8', '#f3e4c8', '#fbf3e4', '#efe2cb']
const ROOFS = ['#e0663a', '#ee8a4a', '#e45c50', '#2fa3a8', '#39b6c9', '#e7774f', '#8a7ad1', '#d9563f', '#3a9fb4']
const ROOF_TYPES = ['gable', 'hip', 'gable', 'gable', 'hip', 'flat']

// Nearest road point, so a building can face its street.
function nearestRoadPoint(x, z) {
  let best = null
  let bd = Infinity
  for (const [px, pz] of ROAD_SAMPLES) {
    const dd = Math.hypot(px - x, pz - z)
    if (dd < bd) { bd = dd; best = [px, pz] }
  }
  return best
}

function placeDistrictBuildings() {
  const rnd = seeded(41)
  const placed = []
  const fits = (x, z, radius) =>
    radiusIn(x, z) < 0.84 &&
    roadClearance(x, z) > radius + 0.1 &&
    heightAt(x, z) - GROUND_Y < 0.03 &&
    creekClearance(x, z) > radius + 0.35 &&
    !placed.some((b) => Math.hypot(b.x - x, b.z - z) < b.radius + radius + 0.22)
  const make = (district, x, z, w, d, h, roof, roofColor, landmark) => {
    const [rx, rz] = nearestRoadPoint(x, z)
    return {
      district, x, z, w, d, h, roof, roofColor, landmark,
      radius: Math.max(w, d) * 0.62,
      wall: WALLS[Math.floor(rnd() * WALLS.length)],
      rot: Math.atan2(rx - x, rz - z),     // front door toward the street
      chimney: !landmark && (roof === 'gable' || roof === 'hip') && rnd() < 0.45,
    }
  }

  // 1. Each district: a landmark and 2-3 houses on the free spots nearest its stop,
  //    placed round-robin (one per district per pass) so neighbours share space.
  const districts = {}
  const lists = {}
  const built = {}
  DISTRICT_ORDER.forEach((id) => {
    const p = LOOP.getPoint(STOP_T[id])
    const candidates = []
    for (let gx = -4; gx <= 4; gx += 0.35) {
      for (let gz = -4; gz <= 4; gz += 0.35) {
        const dist = Math.hypot(gx, gz)
        if (dist < 1.0 || dist > 4) continue
        candidates.push([p.x + gx, p.z + gz, dist])
      }
    }
    lists[id] = candidates.sort((u, v) => u[2] - v[2])
    built[id] = []
  })
  for (let round = 0; round < 4; round++) {
    DISTRICT_ORDER.forEach((id, di) => {
      const buildings = built[id]
      if (buildings.length >= 3 + (di % 2) || buildings.length < round) return
      const landmark = buildings.length === 0
      const w = landmark ? 1.35 + rnd() * 0.3 : 0.85 + rnd() * 0.45
      const d = landmark ? 1.15 + rnd() * 0.25 : 0.8 + rnd() * 0.35
      const spot = lists[id].find(([x, z]) => fits(x, z, Math.max(w, d) * 0.62))
      if (!spot) return
      const roof = landmark ? ['dome', 'tower', 'hip'][di % 3] : ROOF_TYPES[Math.floor(rnd() * ROOF_TYPES.length)]
      const h = landmark ? 1.25 + rnd() * 0.35 : 0.75 + rnd() * 0.4
      const b = make(id, spot[0], spot[1], w, d, h, roof, ROOFS[(di * 3 + buildings.length) % ROOFS.length], landmark)
      buildings.push(b)
      placed.push(b)
    })
  }
  DISTRICT_ORDER.forEach((id, di) => {
    const buildings = built[id]
    const cx = buildings.reduce((sum, b) => sum + b.x, 0) / buildings.length
    const cz = buildings.reduce((sum, b) => sum + b.z, 0) / buildings.length
    const tallest = Math.max(...buildings.map((b) => b.h + (b.roof === 'tower' ? 1.0 : b.roof === 'dome' ? 0.7 : 0.55)))
    const extent = Math.max(...buildings.map((b) => Math.hypot(b.x - cx, b.z - cz) + b.radius))
    districts[id] = { id, index: di, buildings, center: [cx, cz], signY: GROUND_Y + tallest + 1.0, extent }
  })

  // 2. Filler houses along every street, for density and depth; each belongs to
  //    the nearest district, so clicking it selects that district.
  for (let tries = 0, added = 0; added < 24 && tries < 4000; tries++) {
    const [x, z] = coastPoint(rnd() * Math.PI * 2, Math.sqrt(rnd()) * 0.82)
    const clearance = roadClearance(x, z)
    if (clearance > 1.9) continue
    const w = 0.75 + rnd() * 0.4
    const d = 0.7 + rnd() * 0.3
    if (!fits(x, z, Math.max(w, d) * 0.62)) continue
    const owner = DISTRICT_ORDER.reduce((best, id) => {
      const [cx, cz] = districts[id].center
      const [bx, bz] = districts[best].center
      return Math.hypot(cx - x, cz - z) < Math.hypot(bx - x, bz - z) ? id : best
    }, DISTRICT_ORDER[0])
    const b = make(owner, x, z, w, d, 0.65 + rnd() * 0.35, ROOF_TYPES[Math.floor(rnd() * 5)], ROOFS[Math.floor(rnd() * ROOFS.length)], false)
    placed.push(b)
    added++
  }
  return { districts, buildings: placed }
}
export const { districts: DISTRICTS, buildings: BUILDINGS } = placeDistrictBuildings()

// ---------- turbines, accents ----------
export const TURBINES = [
  { x: -7.6, z: -6.3, h: 3.4 },
  { x: -4.6, z: -5.9, h: 2.8 },
  { x: 0.1, z: -6.9, h: 3.7 },
  { x: 2.6, z: -6.0, h: 2.7 },
  { x: 8.6, z: -5.8, h: 3.3 },
  { x: 6.2, z: -4.7, h: 2.5 },
].map((tb) => ({ ...tb, y: heightAt(tb.x, tb.z) }))

// Teal tanks: small tech accents beside a few landmarks.
export const TANKS = DISTRICT_ORDER.filter((_, i) => i % 2 === 0).map((id) => {
  const lm = DISTRICTS[id].buildings[0]
  for (let k = 0; k < 8; k++) {
    const a = lm.rot + Math.PI / 2 + k * (Math.PI / 4)
    const x = lm.x + Math.sin(a) * (lm.radius + 0.45)
    const z = lm.z + Math.cos(a) * (lm.radius + 0.45)
    if (roadClearance(x, z) > 0.3 && !BUILDINGS.some((b) => b !== lm && Math.hypot(b.x - x, b.z - z) < b.radius + 0.35) && radiusIn(x, z) < 0.86) return [x, z]
  }
  return null
}).filter(Boolean)

// ---------- vegetation ----------
function scatter(count, seed, { minRoad, minBuilding, spacing, maxR }) {
  const rnd = seeded(seed)
  const out = []
  for (let tries = 0; out.length < count && tries < count * 80; tries++) {
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * maxR
    const [x, z] = coastPoint(a, r)
    if (radiusIn(x, z) > maxR) continue
    if (roadClearance(x, z) < minRoad) continue
    if (BUILDINGS.some((b) => Math.hypot(b.x - x, b.z - z) < b.radius + minBuilding)) continue
    if (TURBINES.some((tb) => Math.hypot(tb.x - x, tb.z - z) < 0.55)) continue
    if (TANKS.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 0.6)) continue
    if (creekClearance(x, z) < 0.55) continue
    if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < spacing)) continue
    out.push([x, z, rnd(), rnd()])
  }
  return out
}
export const TREES = scatter(150, 17, { minRoad: 0.55, minBuilding: 0.45, spacing: 0.72, maxR: 0.9 })
export const BUSHES = scatter(70, 29, { minRoad: 0.3, minBuilding: 0.2, spacing: 0.5, maxR: 0.92 })
export const FLOWERS = scatter(36, 53, { minRoad: 0.25, minBuilding: 0.25, spacing: 0.6, maxR: 0.85 })

// ---------- docks ----------
export const DOCKS = [Math.PI / 2 + 1.0, 0.62].map((t) => {
  const [x, z] = coastPoint(t, 1.07)
  return { x, z, rot: Math.atan2(Math.cos(t) / RX, Math.sin(t) / RZ) }
})

// ---------- drive mode ----------
export const DRIVE_OBSTACLES = Object.fromEntries([
  ...BUILDINGS.map((b, i) => [`b${i}`, [b.x, GROUND_Y, b.z]]),
  ...MOUNDS.flatMap((m, i) => [-0.4, 0, 0.4].map((f, k) => [`m${i}-${k}`, [m.x + f * m.r, GROUND_Y, m.z]])),
  ...TURBINES.map((tb, i) => [`t${i}`, [tb.x, GROUND_Y, tb.z]]),
])

// ---------- sign positions ----------
// Start above each district's centre, then nudge apart any two that would overlap
// on screen (the camera looks in from +z, so x separation matters most).
export const SIGNS = (() => {
  const signs = DISTRICT_ORDER.map((id) => ({ id, x: DISTRICTS[id].center[0], z: DISTRICTS[id].center[1], y: DISTRICTS[id].signY }))
  for (let iter = 0; iter < 40; iter++) {
    for (let i = 0; i < signs.length; i++) {
      for (let j = i + 1; j < signs.length; j++) {
        const a = signs[i]
        const b = signs[j]
        const dx = b.x - a.x
        const dy = (b.y - b.z * 0.55) - (a.y - a.z * 0.55)   // rough screen-space height
        if (Math.abs(dx) < 2.6 && Math.abs(dy) < 1.1) {
          const push = (2.6 - Math.abs(dx)) / 2 + 0.01
          const dir = dx >= 0 ? 1 : -1
          a.x -= push * dir * 0.5
          b.x += push * dir * 0.5
          if (b.y >= a.y) b.y += 0.12
          else a.y += 0.12
        }
      }
    }
  }
  return Object.fromEntries(signs.map((sgn) => [sgn.id, [sgn.x, sgn.y, sgn.z]]))
})()
