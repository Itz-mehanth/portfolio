// Skill Town's buildings: each district has one main building (a domed hall with a
// portico, a house with a clock tower, or a two-storey manor with a porch) and one
// cottage. Every building is assembled from many small parts (plinth, walls, corner
// pilasters, cornices, framed windows with mullions, sills and shutters, panelled
// doors with steps and canopies, thick roof slabs with tile courses, ridge caps,
// chimneys, a stepping-stone path to the street), then each district's parts are
// merged into two meshes (solid + glass) with per-vertex colour. So the detail
// costs two draw calls per district, and a district can lift as one when selected.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BUILDINGS, DISTRICT_ORDER, heightAt, roadClearance } from './layout'

const C = {
  trim: '#fff6e6',
  pilaster: '#ecdcbc',
  stone: '#cdbfa6',
  stoneDark: '#b3a58c',
  glass: '#4d8fa8',
  door: '#6b3f26',
  brick: '#b0634a',
  brickDark: '#6e4a3d',
  gold: '#e7b443',
  ink: '#2b2b30',
  planter: '#8a5a35',
  bloom: ['#f27aa0', '#ffd55c', '#ff8c6b', '#c9a7f2'],
  leaf: '#5aa648',
  roofFlat: '#d9d2c4',
}

// ---------- unit primitives (shared, never disposed) ----------
const BOX = new THREE.BoxGeometry(1, 1, 1)
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
const COLUMN = new THREE.CylinderGeometry(0.5, 0.5, 1, 10)
const DISC = new THREE.CylinderGeometry(0.5, 0.5, 1, 24)
const DOME = new THREE.SphereGeometry(0.5, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2)
const BALL = new THREE.SphereGeometry(0.5, 10, 8)
const PYRAMID = (() => {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1)
  g.rotateY(Math.PI / 4)
  g.translate(0, 0.5, 0)
  return g
})()
const CONE = (() => {
  const g = new THREE.ConeGeometry(0.5, 1, 12, 1)
  g.translate(0, 0.5, 0)
  return g
})()

const tmpColor = new THREE.Color()
const euler = new THREE.Euler()
const quat = new THREE.Quaternion()
const vPos = new THREE.Vector3()
const vScale = new THREE.Vector3()

// Collects transformed, coloured copies of primitives for one district.
class Kit {
  constructor() {
    this.solid = []
    this.glass = []
  }
  // Add `geometry`, placed by `parent` × local TRS, in `color`.
  add(geometry, color, parent, [x, y, z], [sx, sy, sz], [rx = 0, ry = 0, rz = 0] = [], glass = false) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone()
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
    const local = new THREE.Matrix4().compose(
      vPos.set(x, y, z),
      quat.setFromEuler(euler.set(rx, ry, rz)),
      vScale.set(sx, sy, sz),
    )
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(parent, local))
    tmpColor.set(color)
    const n = g.attributes.position.count
    const colors = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    ;(glass ? this.glass : this.solid).push(g)
  }
  box(color, parent, pos, size, rot, glass) {
    this.add(BOX, color, parent, pos, size, rot, glass)
  }
}

const shade = (hex, k) => `#${tmpColor.set(hex).multiplyScalar(k).getHexString()}`

// A facade's frame: x runs along the wall, y up, z out of the wall.
// side 0 = front (+z, toward the street), 1 = right (+x), 2 = back, 3 = left.
function facade(B, w, d, side) {
  const angle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][side]
  const out = side % 2 === 0 ? d / 2 : w / 2
  const m = new THREE.Matrix4().makeRotationY(angle)
  m.setPosition(new THREE.Vector3(Math.sin(angle) * out, 0, Math.cos(angle) * out))
  return new THREE.Matrix4().multiplyMatrices(B, m)
}

// A framed window: frame, glass, mullion cross, lintel, sill and shutters.
function windowAt(kit, F, x, y, b, { ww = 0.2, wh = 0.26, shutters = true, planter = false } = {}) {
  kit.box(C.trim, F, [x, y, 0.008], [ww + 0.06, wh + 0.06, 0.016])
  kit.box(C.glass, F, [x, y, 0.018], [ww, wh, 0.01], undefined, true)
  kit.box(C.trim, F, [x, y, 0.026], [0.018, wh, 0.01])
  kit.box(C.trim, F, [x, y + wh * 0.08, 0.026], [ww, 0.018, 0.01])
  kit.box(C.pilaster, F, [x, y + wh / 2 + 0.045, 0.016], [ww + 0.1, 0.035, 0.032])
  kit.box(C.pilaster, F, [x, y - wh / 2 - 0.04, 0.03], [ww + 0.1, 0.025, 0.06])
  if (shutters) {
    for (const s of [-1, 1]) kit.box(b.shutter, F, [x + s * (ww / 2 + 0.06), y, 0.014], [0.075, wh + 0.04, 0.02])
  }
  if (planter) {
    kit.box(C.planter, F, [x, y - wh / 2 - 0.09, 0.05], [ww + 0.04, 0.06, 0.07])
    for (let i = 0; i < 4; i++) {
      kit.add(BALL, i % 2 ? C.leaf : C.bloom[(i + Math.round(b.x * 3)) % 4], F,
        [x - ww / 2 + 0.03 + (i * (ww - 0.06)) / 3, y - wh / 2 - 0.05, 0.055], [0.06, 0.05, 0.06])
    }
  }
}

// A panelled door in a frame, with a stone step and a small canopy.
function doorAt(kit, F, x, base, b, { wide = false } = {}) {
  const dw = wide ? 0.34 : 0.24
  const dh = wide ? 0.56 : 0.46
  kit.box(C.trim, F, [x, base + dh / 2 + 0.03, 0.008], [dw + 0.08, dh + 0.06, 0.016])
  kit.box(C.door, F, [x, base + dh / 2, 0.018], [dw, dh, 0.014])
  kit.box(shade(C.door, 0.8), F, [x, base + dh * 0.7, 0.027], [dw * 0.7, dh * 0.28, 0.006])
  kit.box(shade(C.door, 0.8), F, [x, base + dh * 0.28, 0.027], [dw * 0.7, dh * 0.28, 0.006])
  kit.add(BALL, C.gold, F, [x + dw * 0.32, base + dh * 0.48, 0.034], [0.03, 0.03, 0.03])
  kit.box(C.stone, F, [x, base - 0.03, 0.1], [dw + 0.2, 0.06, 0.2])
  kit.box(b.roofColor, F, [x, base + dh + 0.1, 0.12], [dw + 0.22, 0.035, 0.24], [0.18, 0, 0])
  for (const s of [-1, 1]) kit.box(C.trim, F, [x + s * (dw / 2 + 0.07), base + dh + 0.04, 0.08], [0.03, 0.1, 0.12])
}

// Plinth, walls, corner pilasters, cornice and (optionally) a storey band.
function shell(kit, B, w, d, h, b, { storeys = 1 } = {}) {
  kit.box(C.stone, B, [0, 0.05, 0], [w + 0.1, 0.1, d + 0.1])
  kit.box(b.wall, B, [0, 0.1 + h / 2, 0], [w, h, d])
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) kit.box(C.pilaster, B, [sx * w / 2, 0.1 + h / 2, sz * d / 2], [0.09, h, 0.09])
  }
  kit.box(C.trim, B, [0, 0.1 + h - 0.035, 0], [w + 0.07, 0.07, d + 0.07])
  if (storeys === 2) kit.box(C.pilaster, B, [0, 0.1 + h * 0.5, 0], [w + 0.03, 0.045, d + 0.03])
}

// A gabled roof (ridge along x) built from two thick slabs with tile courses, a
// ridge cap, bargeboards and filled gable ends.
function gableRoof(kit, B, w, d, top, b, { pitch = 0.62, ov = 0.14 } = {}) {
  const t = 0.07
  const hd = d / 2 + ov
  const rise = (d / 2) * Math.tan(pitch)
  const L = hd / Math.cos(pitch)
  const roofDark = shade(b.roofColor, 0.78)
  for (const s of [1, -1]) {
    const ny = Math.cos(pitch)
    const nz = s * Math.sin(pitch)
    const cz = (s * hd) / 2
    const cy = top + rise - (hd / 2) * Math.tan(pitch)
    kit.box(b.roofColor, B, [0, cy + ny * t * 0.5, cz + nz * t * 0.5], [w + 2 * ov, t, L], [s * pitch, 0, 0])
    // Tile courses: thin darker strips across the slope.
    for (let k = 1; k <= 4; k++) {
      const f = k / 5 - 0.5            // position along the slab, ridge → eave
      const along = f * L
      kit.box(roofDark, B, [0, cy + ny * (t + 0.008) - Math.sin(pitch) * along, cz + nz * (t + 0.008) + s * Math.cos(pitch) * along],
        [w + 2 * ov + 0.005, 0.016, 0.03], [s * pitch, 0, 0])
    }
    // Bargeboards along the gable edges.
    for (const sx of [-1, 1]) {
      kit.box(C.trim, B, [sx * (w / 2 + ov), cy + ny * t * 0.3, cz + nz * t * 0.3], [0.035, t + 0.04, L + 0.02], [s * pitch, 0, 0])
    }
  }
  kit.box(roofDark, B, [0, top + rise + t * 0.95, 0], [w + 2 * ov + 0.04, 0.07, 0.12])
  // Gable ends: wall-coloured triangles filling the space under the slabs.
  const tri = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, rise)])
  const g = new THREE.ExtrudeGeometry(tri, { depth: w - 0.02, bevelEnabled: false })
  g.translate(0, 0, -(w - 0.02) / 2)
  g.rotateY(Math.PI / 2)
  kit.add(g, b.wall, B, [0, top, 0], [1, 1, 1])
  g.dispose()
  // A small round vent in each gable.
  for (const sx of [-1, 1]) {
    kit.add(DISC, C.trim, B, [sx * (w / 2 - 0.005), top + rise * 0.42, 0], [0.13, 0.02, 0.13], [0, 0, Math.PI / 2])
    kit.add(DISC, C.glass, B, [sx * (w / 2 + 0.006), top + rise * 0.42, 0], [0.08, 0.01, 0.08], [0, 0, Math.PI / 2], true)
  }
  return rise
}

// A hipped roof: a four-sided pyramid over a thick eave slab.
function hipRoof(kit, B, w, d, top, b, { rise = 0.5, ov = 0.14 } = {}) {
  kit.box(shade(b.roofColor, 0.8), B, [0, top + 0.03, 0], [w + 2 * ov, 0.06, d + 2 * ov])
  kit.add(PYRAMID, b.roofColor, B, [0, top + 0.06, 0], [w + 2 * ov - 0.02, rise, d + 2 * ov - 0.02])
  kit.add(BALL, shade(b.roofColor, 0.75), B, [0, top + 0.06 + rise, 0], [0.08, 0.08, 0.08])
  return rise
}

function chimney(kit, B, x, z, base, height) {
  kit.box(C.brick, B, [x, base + height / 2, z], [0.17, height, 0.17])
  kit.box(C.brickDark, B, [x, base + height + 0.025, z], [0.23, 0.05, 0.23])
}

// Stepping stones from the front door to the street.
function gardenPath(kit, B, b, d) {
  const reach = roadClearance(b.x, b.z) - d / 2 + 0.1
  for (let z = d / 2 + 0.32, i = 0; z < d / 2 + reach; z += 0.2, i++) {
    kit.box(i % 2 ? C.stone : C.stoneDark, B, [((i * 37) % 5 - 2) * 0.012, 0.012, z], [0.2, 0.025, 0.13])
  }
}

// ---------- building types ----------
function cottage(kit, B, b) {
  const { w, d, h } = b
  shell(kit, B, w, d, h, b)
  const top = 0.1 + h
  const wy = 0.1 + h * 0.56
  const front = facade(B, w, d, 0)
  doorAt(kit, front, 0, 0.1, b)
  for (const s of [-1, 1]) windowAt(kit, front, s * w * 0.3, wy, b, { planter: true })
  const back = facade(B, w, d, 2)
  for (const s of [-1, 1]) windowAt(kit, back, s * w * 0.25, wy, b)
  for (const side of [1, 3]) windowAt(kit, facade(B, w, d, side), 0, wy, b)
  const rise = b.roof === 'hip' ? hipRoof(kit, B, w, d, top, b, { rise: Math.min(w, d) * 0.55 }) : gableRoof(kit, B, w, d, top, b)
  if (b.chimney) chimney(kit, B, w * 0.28, -d * 0.16, top + rise * 0.3, rise * 0.55 + 0.2)
}

function manor(kit, B, b) {
  const { w, d, h } = b
  shell(kit, B, w, d, h, b, { storeys: 2 })
  const top = 0.1 + h
  const y1 = 0.1 + h * 0.27
  const y2 = 0.1 + h * 0.74
  const front = facade(B, w, d, 0)
  doorAt(kit, front, 0, 0.1, b, { wide: true })
  for (const s of [-1, 1]) {
    windowAt(kit, front, s * w * 0.32, y1, b, { planter: true })
    windowAt(kit, front, s * w * 0.32, y2, b)
  }
  windowAt(kit, front, 0, y2, b, { ww: 0.26 })
  // Porch: a floor, two columns and a roof over the door; a balcony rail above.
  kit.box(C.stone, front, [0, 0.07, 0.24], [0.95, 0.08, 0.48])
  for (const s of [-1, 1]) {
    kit.add(COLUMN, C.trim, front, [s * 0.38, 0.1 + h * 0.23, 0.42], [0.075, h * 0.46, 0.075])
    kit.box(C.trim, front, [s * 0.38, 0.13, 0.42], [0.12, 0.05, 0.12])
  }
  kit.box(b.roofColor, front, [0, 0.1 + h * 0.48, 0.25], [1.06, 0.06, 0.56])
  kit.box(C.trim, front, [0, 0.1 + h * 0.46, 0.25], [1.0, 0.05, 0.52])
  kit.box(C.trim, front, [0, 0.1 + h * 0.58, 0.51], [0.98, 0.03, 0.025])
  for (let i = 0; i < 9; i++) kit.box(C.trim, front, [-0.45 + i * 0.1125, 0.1 + h * 0.53, 0.51], [0.02, h * 0.1, 0.02])
  const back = facade(B, w, d, 2)
  for (const x of [-w * 0.32, 0, w * 0.32]) {
    windowAt(kit, back, x, y1, b)
    windowAt(kit, back, x, y2, b)
  }
  for (const side of [1, 3]) {
    const F = facade(B, w, d, side)
    for (const x of [-d * 0.22, d * 0.22]) {
      windowAt(kit, F, x, y1, b)
      windowAt(kit, F, x, y2, b)
    }
  }
  const rise = hipRoof(kit, B, w, d, top, b, { rise: Math.min(w, d) * 0.5, ov: 0.16 })
  for (const s of [-1, 1]) chimney(kit, B, s * w * 0.3, -d * 0.05, top + rise * 0.25, rise * 0.65 + 0.25)
}

function hall(kit, B, b) {
  const { w, d, h } = b
  shell(kit, B, w, d, h, b, { storeys: 1 })
  const top = 0.1 + h
  const front = facade(B, w, d, 0)
  // Tall windows on every side.
  for (const s of [-1, 1]) windowAt(kit, front, s * w * 0.36, 0.1 + h * 0.5, b, { ww: 0.2, wh: 0.5, shutters: false })
  const back = facade(B, w, d, 2)
  for (const x of [-w * 0.3, 0, w * 0.3]) windowAt(kit, back, x, 0.1 + h * 0.5, b, { ww: 0.2, wh: 0.5, shutters: false })
  for (const side of [1, 3]) {
    const F = facade(B, w, d, side)
    for (const x of [-d * 0.24, d * 0.24]) windowAt(kit, F, x, 0.1 + h * 0.5, b, { ww: 0.2, wh: 0.5, shutters: false })
  }
  // Portico: three steps, four columns, an entablature and a pediment.
  const pw = Math.min(1.15, w * 0.62)
  for (let i = 0; i < 3; i++) kit.box(C.stone, front, [0, 0.03 + i * 0.05, 0.42 - i * 0.07], [pw + 0.3 - i * 0.08, 0.06, 0.42 - i * 0.12])
  doorAt(kit, front, 0, 0.1, b, { wide: true })
  const colH = h * 0.86
  for (let i = 0; i < 4; i++) {
    const x = -pw / 2 + 0.08 + (i * (pw - 0.16)) / 3
    kit.add(COLUMN, C.trim, front, [x, 0.16 + colH / 2, 0.38], [0.085, colH, 0.085])
    kit.box(C.trim, front, [x, 0.17, 0.38], [0.13, 0.04, 0.13])
    kit.box(C.trim, front, [x, 0.16 + colH, 0.38], [0.13, 0.04, 0.13])
  }
  kit.box(C.trim, front, [0, 0.2 + colH + 0.03, 0.22], [pw + 0.12, 0.1, 0.5])
  const tri = new THREE.Shape([new THREE.Vector2(-(pw + 0.12) / 2, 0), new THREE.Vector2((pw + 0.12) / 2, 0), new THREE.Vector2(0, 0.3)])
  const ped = new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: false })
  ped.translate(0, 0, -0.03)
  kit.add(ped, C.trim, front, [0, 0.2 + colH + 0.08, 0], [1, 1, 1])
  ped.dispose()
  // Flat roof with a parapet, then a drum, a dome and a lantern.
  kit.box(C.roofFlat, B, [0, top + 0.02, 0], [w - 0.02, 0.04, d - 0.02])
  kit.box(C.trim, B, [0, top + 0.07, d / 2], [w + 0.08, 0.14, 0.08])
  kit.box(C.trim, B, [0, top + 0.07, -d / 2], [w + 0.08, 0.14, 0.08])
  kit.box(C.trim, B, [w / 2, top + 0.07, 0], [0.08, 0.14, d + 0.08])
  kit.box(C.trim, B, [-w / 2, top + 0.07, 0], [0.08, 0.14, d + 0.08])
  const r = Math.min(w, d) * 0.3
  kit.add(CYL, b.wall, B, [0, top + 0.2, 0], [r * 2, 0.36, r * 2])
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    kit.box(C.pilaster, B, [Math.sin(a) * r, top + 0.2, Math.cos(a) * r], [0.05, 0.36, 0.05], [0, a, 0])
    if (i % 2 === 0) kit.box(C.glass, B, [Math.sin(a + 0.31) * (r + 0.005), top + 0.22, Math.cos(a + 0.31) * (r + 0.005)], [0.07, 0.16, 0.01], [0, a + 0.31, 0], true)
  }
  kit.add(CYL, C.trim, B, [0, top + 0.4, 0], [r * 2 + 0.08, 0.05, r * 2 + 0.08])
  kit.add(DOME, b.roofColor, B, [0, top + 0.42, 0], [r * 2, r * 1.9, r * 2])
  kit.add(CYL, C.trim, B, [0, top + 0.42 + r * 0.95 + 0.07, 0], [0.12, 0.14, 0.12])
  kit.add(CONE, b.roofColor, B, [0, top + 0.42 + r * 0.95 + 0.14, 0], [0.16, 0.14, 0.16])
  kit.add(BALL, C.gold, B, [0, top + 0.42 + r * 0.95 + 0.31, 0], [0.07, 0.07, 0.07])
}

function clockHouse(kit, B, b) {
  const { w, d } = b
  const h = b.h * 0.82
  shell(kit, B, w, d, h, b, { storeys: 2 })
  const top = 0.1 + h
  const y1 = 0.1 + h * 0.27
  const y2 = 0.1 + h * 0.74
  const front = facade(B, w, d, 0)
  doorAt(kit, front, -w * 0.12, 0.1, b, { wide: true })
  windowAt(kit, front, -w * 0.38, y1, b, { planter: true })
  for (const x of [-w * 0.38, -w * 0.12]) windowAt(kit, front, x, y2, b)
  const back = facade(B, w, d, 2)
  for (const x of [-w * 0.3, 0, w * 0.3]) {
    windowAt(kit, back, x, y1, b)
    windowAt(kit, back, x, y2, b)
  }
  const left = facade(B, w, d, 3)
  for (const x of [-d * 0.22, d * 0.22]) {
    windowAt(kit, left, x, y1, b)
    windowAt(kit, left, x, y2, b)
  }
  const rise = gableRoof(kit, B, w, d, top, b, { pitch: 0.58 })
  chimney(kit, B, -w * 0.3, -d * 0.18, top + rise * 0.3, rise * 0.55 + 0.25)

  // The tower: square, at the front-right corner, standing a little proud.
  const tw = 0.66
  const th = b.h + 1.0
  const T = new THREE.Matrix4().multiplyMatrices(B, new THREE.Matrix4().makeTranslation(w / 2 - tw / 2 + 0.06, 0, d / 2 - tw / 2 + 0.12))
  kit.box(C.stone, T, [0, 0.05, 0], [tw + 0.1, 0.1, tw + 0.1])
  kit.box(b.wall, T, [0, 0.1 + th / 2, 0], [tw, th, tw])
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) kit.box(C.pilaster, T, [sx * tw / 2, 0.1 + th / 2, sz * tw / 2], [0.1, th, 0.1])
  }
  for (const yy of [0.1 + th * 0.36, 0.1 + th * 0.7]) kit.box(C.pilaster, T, [0, yy, 0], [tw + 0.04, 0.045, tw + 0.04])
  const tf = facade(T, tw, tw, 0)
  windowAt(kit, tf, 0, 0.1 + th * 0.22, b, { ww: 0.18, wh: 0.24, shutters: false })
  windowAt(kit, tf, 0, 0.1 + th * 0.53, b, { ww: 0.16, wh: 0.22, shutters: false })
  // Clock faces on three sides: white dial, dark rim, hour marks and hands.
  const cy = 0.1 + th * 0.85
  for (const side of [0, 1, 2]) {
    const F = facade(T, tw, tw, side)
    kit.add(DISC, C.ink, F, [0, cy, 0.012], [0.46, 0.02, 0.46], [Math.PI / 2, 0, 0])
    kit.add(DISC, '#fffdf6', F, [0, cy, 0.022], [0.4, 0.02, 0.4], [Math.PI / 2, 0, 0])
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      kit.box(C.ink, F, [Math.sin(a) * 0.16, cy + Math.cos(a) * 0.16, 0.034], [0.02, k % 3 === 0 ? 0.05 : 0.03, 0.006], [0, 0, -a])
    }
    kit.box(C.ink, F, [0.04, cy + 0.03, 0.038], [0.025, 0.11, 0.006], [0, 0, -0.9])
    kit.box(C.ink, F, [0, cy + 0.06, 0.04], [0.02, 0.14, 0.006])
    kit.add(BALL, C.gold, F, [0, cy, 0.042], [0.03, 0.03, 0.02])
  }
  kit.box(C.trim, T, [0, 0.1 + th + 0.04, 0], [tw + 0.14, 0.08, tw + 0.14])
  kit.box(shade(b.roofColor, 0.8), T, [0, 0.1 + th + 0.1, 0], [tw + 0.2, 0.05, tw + 0.2])
  kit.add(PYRAMID, b.roofColor, T, [0, 0.1 + th + 0.12, 0], [tw + 0.18, 0.75, tw + 0.18])
  kit.add(COLUMN, C.gold, T, [0, 0.1 + th + 0.95, 0], [0.025, 0.2, 0.025])
  kit.add(BALL, C.gold, T, [0, 0.1 + th + 0.9, 0], [0.07, 0.07, 0.07])
}

const BUILDERS = { gable: cottage, hip: cottage, manor, hall, clock: clockHouse }

function buildDistrict(id) {
  const kit = new Kit()
  for (const b of BUILDINGS) {
    if (b.district !== id) continue
    const B = new THREE.Matrix4().compose(
      new THREE.Vector3(b.x, heightAt(b.x, b.z), b.z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot),
      new THREE.Vector3(1, 1, 1),
    )
    ;(BUILDERS[b.roof] || cottage)(kit, B, b)
    gardenPath(kit, B, b, b.d)
  }
  const merge = (list) => {
    if (!list.length) return null
    const g = mergeGeometries(list, false)
    list.forEach((p) => p.dispose())
    g.computeBoundingSphere()
    return g
  }
  return { solid: merge(kit.solid), glass: merge(kit.glass) }
}

const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 })
const GLASS = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.25, emissive: '#16384a', emissiveIntensity: 0.35 })

function District({ id, geometry, selected, onSelect }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    const target = selected ? 0.06 : 0
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 8, delta)
  })
  const handlers = {
    onClick: (e) => {
      e.stopPropagation()
      onSelect(id)
    },
    onPointerOver: (e) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }
  return (
    <group ref={ref}>
      {geometry.solid && <mesh geometry={geometry.solid} material={SOLID} castShadow receiveShadow {...handlers} />}
      {geometry.glass && <mesh geometry={geometry.glass} material={GLASS} {...handlers} />}
    </group>
  )
}

export default function Buildings({ selected, onSelect }) {
  const districts = useMemo(() => Object.fromEntries(DISTRICT_ORDER.map((id) => [id, buildDistrict(id)])), [])
  useEffect(
    () => () => Object.values(districts).forEach(({ solid, glass }) => {
      solid?.dispose()
      glass?.dispose()
    }),
    [districts],
  )
  return (
    <group>
      {DISTRICT_ORDER.map((id) => (
        <District key={id} id={id} geometry={districts[id]} selected={id === selected} onSelect={onSelect} />
      ))}
    </group>
  )
}
