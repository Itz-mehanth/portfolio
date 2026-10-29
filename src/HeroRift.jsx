// The Home hero's "paper rift": the paper page behind the hero tears open, with
// burning amber edges, onto a living alien sky (nebula, stars, a ringed planet).
// The tear drifts toward the cursor. Ported from HandForge's Erasure shader
// (a sphere that tears the room open onto a level's sky) to a 2D screen-space
// pass, and written against raw WebGL so Home ships no three.js at all.
// Palette: HandForge's VEIL SANCTUM world, which matches the ink/amber system.
import { useEffect, useRef } from 'react'

const RENDER_SCALE = 0.65   // the sky is soft noise; render below CSS size, upscale for free
const MAX_DPR = 1.25
const OPEN_SECONDS = 1.9    // the tear opening on arrival

const PALETTE = {
  top: [0.027, 0.012, 0.102],     // #07031A
  horizon: [1.0, 0.784, 0.341],   // #FFC857
  cloud: [0.227, 0.102, 0.478],   // #3A1A7A
  planet: [1.0, 0.91, 0.659],     // #FFE8A8
  edge: [0.961, 0.62, 0.043],     // #F59E0B, the site accent
  hot: [1.0, 0.973, 0.886],       // white-hot core of the burn
}

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uOpen;
uniform vec2 uMouse;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec3 uTop, uHorizon, uCloud, uPlanet, uEdge, uHot;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
  return s;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * aspect, uv.y);                       // height units, y up
  vec2 mouse = (uMouse - 0.5) * vec2(aspect, 1.0);
  // The hole is cut in the page, so it barely moves; what's behind it moves a lot.
  vec2 c = vec2(uCenter.x * aspect, uCenter.y) + mouse * 0.015;

  vec2 e = (p - c) * vec2(0.85, 1.15);
  float d = length(e) / uRadius;
  if (d > 2.1) { gl_FragColor = vec4(0.0); return; }        // far from the tear: skip everything

  // Embers peeling off the burning rim and drifting out over the page.
  // Angles are measured from a rotated frame so atan's +-pi seam sits at the upper
  // right, under the hero photo, instead of cutting embers on the visible left rim.
  vec3 ember = vec3(0.0);
  float emberA = 0.0;
  const float SEAM = 2.3562;                                 // 3*pi/4
  vec2 er = vec2(cos(SEAM) * e.x - sin(SEAM) * e.y, sin(SEAM) * e.x + cos(SEAM) * e.y);
  float ang = atan(er.y, er.x);
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float cells = 46.0 + fi * 17.0;
    float cell = floor((ang / 6.2831853 + 0.5) * cells);
    float h1 = hash(vec3(cell, fi, 3.0));
    if (h1 > 0.55) {
      float life = fract(uTime * (0.16 + 0.12 * h1) + h1 * 7.0);
      float a0 = ((cell + 0.5 + (hash(vec3(cell, fi, 9.0)) - 0.5) * 0.6) / cells - 0.5) * 6.2831853;
      vec2 ep = vec2(cos(a0), sin(a0)) * (0.92 + life * 0.8) * uRadius;
      float size = (0.006 + 0.008 * (1.0 - life)) * uRadius / 0.3;
      float glow = (1.0 - smoothstep(0.0, size, length(er - ep))) * (1.0 - life) * smoothstep(0.0, 0.08, life);
      ember += mix(vec3(1.0, 0.42, 0.05), uHot, pow(1.0 - life, 3.0)) * glow * 1.4;
      emberA = max(emberA, glow);
    }
  }

  // Tear field: > 0 inside. Elliptical falloff, torn up by noise, grown by uOpen.
  float n = fbm(vec3(p * 3.2, uTime * 0.06));
  float fibres = noise(vec3(p * 18.0, uTime * 0.08));       // jagged, fibrous paper edge
  float field = (1.0 - d) * 1.2 + (n - 0.5) * 1.0 + (fibres - 0.5) * 0.32 - (1.0 - uOpen) * 1.4;
  if (field < -0.11) { gl_FragColor = vec4(ember, min(1.0, emberA)); return; }  // paper (+ embers)

  // Behind the hole, in portal units. Deeper layers shift further with the cursor.
  vec2 sv = (p - c) / uRadius;

  // Far layer: the sky and a nebula slowly spiralling into a bright far core.
  vec2 qf = sv + mouse * 0.9;
  float rl = length(qf);
  float sw = uTime * 0.05 + 0.6 / (rl + 0.35);
  vec2 qs = vec2(cos(sw) * qf.x - sin(sw) * qf.y, sin(sw) * qf.x + cos(sw) * qf.y);
  float neb = fbm(vec3(qs * 1.3, 3.7 + uTime * 0.03));
  vec3 sky = mix(uHorizon * 0.7, uTop, smoothstep(-0.55, 0.35, qf.y));
  sky = mix(sky, uCloud * 2.0, smoothstep(0.38, 0.8, neb) * 0.85);
  sky += vec3(0.9, 0.3, 0.65) * pow(smoothstep(0.6, 0.95, neb), 2.0) * 0.35;
  sky += uHorizon * pow(smoothstep(0.62, 1.0, neb), 3.0) * 0.3;
  sky += uHot * 0.22 * exp(-rl * rl * 7.0);

  // Stars streaming out of the portal toward you: four depth slices that grow as they near.
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float z = fract(uTime * 0.07 + fi * 0.25);              // 0 = deep inside, 1 = at the mouth
    vec2 g = (sv + mouse * mix(0.9, 0.1, z)) * mix(7.0, 0.8, z) + fi * 13.7;
    vec2 id = floor(g);
    float h = hash(vec3(id, fi + 5.0));
    if (h > 0.8) {
      vec2 o = (vec2(hash(vec3(id, fi + 11.0)), hash(vec3(id, fi + 17.0))) - 0.5) * 0.7;
      float s = length(fract(g) - 0.5 - o);
      float fade = smoothstep(0.0, 0.25, z) * (1.0 - smoothstep(0.8, 1.0, z));
      sky += vec3(0.92, 0.95, 1.0) * (1.0 - smoothstep(0.0, mix(0.03, 0.17, z * z), s)) * fade * 1.3;
    }
  }

  // Middle layer: a ringed planet, turning, lit from the upper left.
  vec2 v = (sv + mouse * 0.45 - vec2(-0.14, -0.12)) / 0.3;   // clear of the hero photo (upper right)
  float r = length(v);
  float body = 1.0 - smoothstep(0.97, 1.0, r);
  vec3 normal = vec3(v, sqrt(max(0.0, 1.0 - r * r)));
  float lit = clamp(dot(normal, normalize(vec3(-0.55, 0.6, 0.6))), 0.0, 1.0);
  float lon = atan(v.x, max(normal.z, 0.001)) + uTime * 0.12;  // longitude, so the bands rotate
  float bands = 0.09 * sin(v.y * 22.0 + noise(vec3(lon * 2.5, v.y * 5.0, 1.0)) * 3.5);
  vec3 planet = uPlanet * (0.06 + 0.94 * lit + bands) + uHorizon * pow(1.0 - normal.z, 3.0) * 0.6 * body;
  float ca = cos(-0.35), sa = sin(-0.35);
  vec2 rv = vec2(ca * v.x - sa * v.y, sa * v.x + ca * v.y);
  float rr = length(vec2(rv.x, rv.y * 3.4));
  float ring = smoothstep(1.32, 1.4, rr) * (1.0 - smoothstep(1.85, 1.95, rr)) * (0.55 + 0.45 * sin(rr * 40.0));
  float ringVisible = ring * (1.0 - body * step(0.0, rv.y));   // front half crosses the planet
  sky = mix(sky, planet, body);
  sky = mix(sky, uPlanet * 0.9, ringVisible * 0.7);

  // Depth: the inside darkens toward the rim, like looking down a tunnel mouth.
  sky *= mix(0.22, 1.0, smoothstep(0.0, 0.45, field));

  // Burning edge: amber band with a flickering white-hot core.
  float inside = smoothstep(0.0, 0.015, field);
  float band = 1.0 - smoothstep(0.0, 0.06, abs(field));
  float flicker = 0.75 + 0.25 * noise(vec3(p * 24.0, uTime * 3.0));
  vec3 burn = mix(uEdge, uHot, pow(band, 4.0)) * (1.1 + 0.6 * flicker);
  vec3 col = mix(sky, burn, band);
  float alpha = max(inside, band);

  // Charred paper lip, shaded by which way it faces the light: reads as curled, not printed.
  float facing = 0.5 + 0.5 * dot(normalize(p - c), normalize(vec2(-0.6, 0.8)));
  float charred = smoothstep(-0.11, -0.03, field) * (1.0 - inside) * (1.0 - band);
  col = mix(col, mix(vec3(0.09, 0.045, 0.02), vec3(0.5, 0.32, 0.15), facing), charred);
  alpha = max(alpha, charred * 0.6);

  gl_FragColor = vec4(col * alpha + ember, min(1.0, max(alpha, emberA)));   // premultiplied
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('HeroRift shader:', gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

// Where the tear sits: right of the hero copy on wide screens, below it on phones.
const layoutFor = (width, height) =>
  width / height < 0.9 ? { center: [0.5, 0.2], radius: 0.24 } : { center: [0.79, 0.4], radius: 0.3 }

export default function HeroRift({ active = true }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl || gl.isContextLost()) return undefined

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    if (!vs || !fs) return undefined
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined
    gl.useProgram(program)

    // One triangle that covers the viewport.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = (name) => gl.getUniformLocation(program, name)
    const uRes = u('uRes')
    const uTime = u('uTime')
    const uOpen = u('uOpen')
    const uMouse = u('uMouse')
    const uCenter = u('uCenter')
    const uRadius = u('uRadius')
    gl.uniform3fv(u('uTop'), PALETTE.top)
    gl.uniform3fv(u('uHorizon'), PALETTE.horizon)
    gl.uniform3fv(u('uCloud'), PALETTE.cloud)
    gl.uniform3fv(u('uPlanet'), PALETTE.planet)
    gl.uniform3fv(u('uEdge'), PALETTE.edge)
    gl.uniform3fv(u('uHot'), PALETTE.hot)

    // Cursor, smoothed so the tear drifts rather than snaps.
    const target = { x: 0.5, y: 0.5 }
    const mouse = { x: 0.5, y: 0.5 }
    const onPointer = (e) => {
      target.x = e.clientX / window.innerWidth
      target.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const draw = (time, open) => {
      gl.uniform1f(uTime, time)
      gl.uniform1f(uOpen, open)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // Reduced motion: a single still frame, fully open, redrawn on every resize.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE
      const w = Math.max(1, Math.round(canvas.clientWidth * scale))
      const h = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w   // resizing clears the drawing buffer
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
      const { center, radius } = layoutFor(canvas.clientWidth, canvas.clientHeight)
      gl.uniform2f(uCenter, center[0], center[1])
      gl.uniform1f(uRadius, radius)
      if (still) draw(12, 1)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    let frame = 0
    if (!still) {
      const start = performance.now()
      const loop = (now) => {
        frame = requestAnimationFrame(loop)
        if (!activeRef.current || document.hidden) return
        const t = (now - start) / 1000
        const k = Math.min(1, Math.max(0, (t - 0.15) / OPEN_SECONDS))
        mouse.x += (target.x - mouse.x) * 0.07
        mouse.y += (target.y - mouse.y) * 0.07
        draw(t, 1 - Math.pow(1 - k, 3))
      }
      frame = requestAnimationFrame(loop)
    }

    // Free GPU resources but keep the context alive: StrictMode (dev) unmounts and
    // remounts, and getContext() would hand the remount the same, now-lost context.
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
