// The five sections as worlds in the viewer's room. Coordinates are the "stage":
// metres from the floor, with the viewer at the origin facing -z (MRScene places
// the stage where the viewer stood when the session started).
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import SkillTownWorld from '../skilltown'
import { FramedCertificate, Medal, Trophy, Coin, Mug, Book, Plant, Rocks, Window, rockGeometry } from '../Desk3D'
import { SKILLS_BY_DISTRICT, DISTRICT_NAMES } from '../data/skills'
import { HACKATHONS, CERTIFICATIONS } from '../data/awards'
import { PROJECTS } from '../data/projects'
import { AMBER, INK, Button, Chips, Label, OrbitingPlane, Panel } from './ui'

// Faces a point on the stage toward the viewer at the origin.
const facing = (x, z) => Math.atan2(-x, -z)
const onArc = (radius, deg, y) => {
  const a = THREE.MathUtils.degToRad(deg)
  return [Math.sin(a) * radius, y, -Math.cos(a) * radius]
}

// Something drifting gently up and down.
function Bob({ children, amount = 0.03, speed = 0.8, phase = 0, animate = true, ...props }) {
  const ref = useRef()
  const base = props.position?.[1] ?? 0
  useFrame(({ clock }) => {
    if (ref.current && animate) ref.current.position.y = base + Math.sin(clock.elapsedTime * speed + phase) * amount
  })
  return <group ref={ref} {...props}>{children}</group>
}

const STONE = new THREE.MeshStandardMaterial({ color: '#cfc7b8', roughness: 0.9, flatShading: true })

// Paper-world rocks hanging in the air around the viewer, slowly turning.
function FloatingRocks({ count = 7, radius = [1.6, 2.6], animate }) {
  const rocks = useMemo(() => Array.from({ length: count }, (_, i) => {
    const deg = -120 + (i * 240) / (count - 1)
    const r = radius[0] + ((i * 37) % 10) / 10 * (radius[1] - radius[0])
    return { geometry: rockGeometry(i * 7 + 3, 0.06 + ((i * 13) % 5) * 0.025), position: onArc(r, deg, 0.7 + ((i * 29) % 10) / 10 * 1.7), spin: 0.1 + (i % 3) * 0.08 }
  }), [count, radius])
  const refs = useRef([])
  useFrame((_, delta) => {
    if (!animate) return
    refs.current.forEach((m, i) => {
      if (!m) return
      m.rotation.y += delta * rocks[i].spin
      m.rotation.x += delta * rocks[i].spin * 0.5
    })
  })
  return rocks.map((r, i) => (
    <Bob key={i} position={r.position} amount={0.05} speed={0.5 + i * 0.07} phase={i} animate={animate}>
      <mesh ref={(m) => { refs.current[i] = m }} geometry={r.geometry} material={STONE} />
    </Bob>
  ))
}

// ---------- 01 Home: the paper rift, the name, a paper plane ----------
export function HomeWorld({ animate }) {
  const hint = onArc(0.95, 38, 1.22)
  return (
    <group>
      <group position={[0, 1.62, -2.3]}>
        <Text position={[0, 0.36, 0]} fontSize={0.06} color={AMBER} letterSpacing={0.25} anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor={INK}>
          HI, I&apos;M
        </Text>
        <Text fontSize={0.42} color="#fffaf0" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={-0.02} outlineWidth={0.012} outlineColor={INK}>
          Mehanth
        </Text>
        <Text position={[0, -0.33, 0]} fontSize={0.085} color="#fffaf0" anchorX="center" anchorY="middle" outlineWidth={0.006} outlineColor={INK}>
          Full-stack &amp; 3D web developer
        </Text>
        <Text position={[0, -0.46, 0]} fontSize={0.045} color="#f4efe4" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor={INK}>
          Software Engineer Intern @ VISA · Computer Science @ SSN, Chennai
        </Text>
      </group>
      <OrbitingPlane center={[0, 1.55, -1.2]} radius={1.05} animate={animate} />
      <OrbitingPlane center={[0.3, 2.0, -1.8]} radius={0.7} speed={-0.5} animate={animate} phase={2} />
      <FloatingRocks animate={animate} />
      <Panel position={hint} rotation={[0, facing(hint[0], hint[2]), 0]} width={0.36} height={0.17}>
        <Label position={[-0.16, 0.065, 0]} size={0.013} color="#8a7a5c" letterSpacing={0.12}>WELCOME TO MY WORLD</Label>
        <Label position={[-0.16, 0.04, 0]} size={0.017} maxWidth={0.32}>
          Each section of my portfolio tears open its own world in your room. Press a tile on the dock below to travel.
        </Label>
      </Panel>
    </group>
  )
}

// ---------- 02 Skills: Skill Town on a table ----------
export function SkillsWorld({ animate }) {
  const [district, setDistrict] = useState('languages')
  const skills = SKILLS_BY_DISTRICT[district]?.map((s) => s.name) ?? []
  const card = onArc(0.95, 42, 1.3)
  return (
    <group>
      <group position={[0, 0, -1.05]}>
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.42, 0.5, 0.82, 48]} />
          <meshStandardMaterial color="#f4efe4" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.832, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.024, 64]} />
          <meshStandardMaterial color="#e9dcc1" roughness={0.85} />
        </mesh>
        <group position={[0, 0.846, 0]} scale={0.045}>
          <SkillTownWorld tabletop selected={district} onSelect={setDistrict} reducedMotion={!animate} />
        </group>
      </group>
      <Panel position={card} rotation={[0, facing(card[0], card[2]), 0]} width={0.5} height={0.44}>
        <Label position={[-0.22, 0.2, 0]} size={0.013} color="#8a7a5c" letterSpacing={0.12}>02 · SKILLS</Label>
        <Label position={[-0.22, 0.178, 0]} size={0.045} weight="bold">Skill Town</Label>
        <Label position={[-0.22, 0.12, 0]} size={0.015} maxWidth={0.44} color="#55555c">
          Tap any sign or house on the island to see the skills in that district.
        </Label>
        <group position={[-0.22, 0.06, 0]}>
          <mesh position={[0.08, -0.016, 0]}>
            <planeGeometry args={[0.16, 0.032]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <Text position={[0.08, -0.016, 0.001]} fontSize={0.013} color={AMBER} anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.08}>
            {(DISTRICT_NAMES[district] || '').toUpperCase()}
          </Text>
        </group>
        <Chips position={[-0.22, 0.008, 0]} items={skills} width={0.44} size={0.015} />
      </Panel>
    </group>
  )
}

// ---------- 03 Work: project balloons around the room ----------
const BALLOON_COLORS = [['#ff6a3d', '#fff1e0'], ['#3fa6e6', '#ffffff'], ['#ffb51b', '#fff6dc'], ['#7a5cff', '#f1ecff'], ['#2fb38a', '#eafff6'], ['#ff4f8b', '#ffe6ef']]

function useBalloonGeometry() {
  return useMemo(() => {
    const profile = [[0, -0.17], [0.05, -0.15], [0.11, -0.09], [0.15, 0.01], [0.165, 0.09], [0.15, 0.18], [0.1, 0.245], [0, 0.27]]
    const g = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 16).toNonIndexed()
    // Gores: alternate colour every slice (stored as 0/1, coloured per balloon).
    const pos = g.attributes.position
    const stripe = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3
      const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3
      const slice = Math.floor(((Math.atan2(cz, cx) + Math.PI) / (Math.PI * 2)) * 16)
      stripe[i] = stripe[i + 1] = stripe[i + 2] = slice % 2
    }
    g.setAttribute('stripe', new THREE.BufferAttribute(stripe, 1))
    g.computeVertexNormals()
    return g
  }, [])
}

function ProjectBalloon({ project, colors, position, geometry, onOpen, animate, phase }) {
  const envelope = useMemo(() => {
    const g = geometry.clone()
    const stripe = g.attributes.stripe
    const a = new THREE.Color(colors[0])
    const b = new THREE.Color(colors[1])
    const c = new Float32Array(stripe.count * 3)
    for (let i = 0; i < stripe.count; i++) (stripe.getX(i) ? b : a).toArray(c, i * 3)
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    return g
  }, [geometry, colors])
  return (
    <Bob position={position} amount={0.04} speed={0.6} phase={phase} animate={animate}>
      <group rotation={[0, facing(position[0], position[2]), 0]} onClick={(e) => { e.stopPropagation(); onOpen(project.slug) }}>
        <mesh geometry={envelope}>
          <meshStandardMaterial vertexColors roughness={0.45} />
        </mesh>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * 0.03, -0.215, sz * 0.03]}>
            <cylinderGeometry args={[0.0015, 0.0015, 0.09, 4]} />
            <meshBasicMaterial color="#5a4630" />
          </mesh>
        ))}
        <mesh position={[0, -0.275, 0]}>
          <boxGeometry args={[0.07, 0.05, 0.07]} />
          <meshStandardMaterial color="#9c6b3c" roughness={0.8} />
        </mesh>
        <Text position={[0, -0.33, 0]} fontSize={0.03} color="#ffffff" anchorX="center" anchorY="top" fontWeight="bold" outlineWidth={0.004} outlineColor={INK} maxWidth={0.4} textAlign="center">
          {project.title}
        </Text>
      </group>
    </Bob>
  )
}

// A little floating island, like the flight world's.
function Islet({ position, scale = 1, animate, phase }) {
  return (
    <Bob position={position} amount={0.05} speed={0.4} phase={phase} animate={animate}>
      <group scale={scale}>
        <mesh position={[0, -0.09, 0]}>
          <coneGeometry args={[0.16, 0.22, 7]} />
          <meshStandardMaterial color="#b9714a" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.17, 0.16, 0.04, 7]} />
          <meshStandardMaterial color="#7cc45a" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.04, 0.12, 0]}>
          <icosahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#4f9d42" roughness={0.9} flatShading />
        </mesh>
      </group>
    </Bob>
  )
}

export function WorkWorld({ animate, onLink }) {
  const geometry = useBalloonGeometry()
  const projects = useMemo(() => PROJECTS.filter((p) => p.z || p.type === 'xr').slice(0, 9), [])
  const [open, setOpen] = useState(null)
  const spots = useMemo(() => projects.map((_, i) => {
    const deg = -105 + (i * 210) / Math.max(1, projects.length - 1)
    return onArc(1.75, deg, 1.4 + (i % 3) * 0.26)
  }), [projects])
  const index = projects.findIndex((p) => p.slug === open)
  const project = projects[index]
  // The open project's card comes in toward the viewer from its balloon.
  const card = project ? [spots[index][0] * 0.55, 1.32, spots[index][2] * 0.55] : null
  const hint = onArc(0.9, -40, 1.0)
  return (
    <group>
      {projects.map((p, i) => (
        <ProjectBalloon key={p.slug} project={p} colors={BALLOON_COLORS[i % BALLOON_COLORS.length]} position={spots[i]} geometry={geometry} onOpen={setOpen} animate={animate} phase={i * 0.9} />
      ))}
      {[[-2.6, 0.9, -2.4, 1.2], [2.4, 1.1, -2.7, 1.5], [-3.1, 1.6, -0.6, 1], [3.0, 0.8, -0.9, 1.3], [0.4, 0.7, -3.3, 1.7]].map(([x, y, z, s], i) => (
        <Islet key={i} position={[x, y, z]} scale={s} animate={animate} phase={i} />
      ))}
      <OrbitingPlane center={[0, 1.7, -1.4]} radius={1.3} speed={0.45} animate={animate} />
      <Panel position={hint} rotation={[-0.35, facing(hint[0], hint[2]), 0, 'YXZ']} width={0.34} height={0.12}>
        <Label position={[-0.15, 0.045, 0]} size={0.013} color="#8a7a5c" letterSpacing={0.12}>03 · WORK</Label>
        <Label position={[-0.15, 0.022, 0]} size={0.016} maxWidth={0.3}>Every balloon is a project. Tap one to read its story.</Label>
      </Panel>
      {project && (
        <Panel position={card} rotation={[0, facing(card[0], card[2]), 0]} width={0.52} height={0.4}>
          <Label position={[-0.23, 0.18, 0]} size={0.013} color="#8a7a5c" letterSpacing={0.12}>
            {[project.year, project.type === 'xr' ? 'MIXED REALITY' : project.type?.toUpperCase()].filter(Boolean).join(' · ')}
          </Label>
          <Label position={[-0.23, 0.158, 0]} size={0.034} weight="bold" maxWidth={0.46}>{project.title}</Label>
          <Label position={[-0.23, 0.095, 0]} size={0.016} maxWidth={0.46} color="#55555c">{project.description}</Label>
          {project.stack && <Chips position={[-0.23, 0.02, 0]} items={project.stack.slice(0, 6)} width={0.46} size={0.013} />}
          <group position={[0, -0.16, 0]}>
            {project.url && <Button position={[-0.08, 0, 0]} width={0.14} label="Open live site" dark onPress={() => onLink(project.url)} />}
            {project.repoUrl && <Button position={[0.08, 0, 0]} width={0.14} label="View code" onPress={() => onLink(project.repoUrl)} />}
            {!project.url && !project.repoUrl && <Label position={[-0.23, 0.01, 0]} size={0.014} color="#8a7a5c">Links coming soon.</Label>}
          </group>
          <Button position={[0.21, 0.17, 0]} width={0.05} height={0.032} label="✕" size={0.014} onPress={() => setOpen(null)} />
        </Panel>
      )}
    </group>
  )
}

// ---------- 04 Awards: a shelf of real trophies, cards in an arc ----------
export function AwardsWorld({ animate }) {
  return (
    <group>
      <group position={[0, 0, -1.15]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.3, 0.035, 0.32]} />
          <meshStandardMaterial color="#8a5a32" roughness={0.6} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.93, -0.06]}>
            <boxGeometry args={[0.03, 0.12, 0.18]} />
            <meshStandardMaterial color="#6e4426" roughness={0.6} />
          </mesh>
        ))}
        <FramedCertificate scale={0.2} position={[0.02, 1.185, -0.06]} rotation={[-0.1, 0, 0]} />
        <Medal animate={animate} scale={0.2} position={[-0.4, 1.12, 0.05]} rotation={[0.05, 0.3, -0.15]} />
        <Trophy scale={0.22} position={[0.45, 1.018, 0.02]} rotation={[0, -0.3, 0]} />
        <Coin scale={0.22} position={[0.18, 1.03, 0.11]} />
        <Coin scale={0.22} position={[-0.16, 1.03, 0.12]} rotation={[0.2, 0, 0.1]} />
        <pointLight position={[0.2, 1.6, 0.4]} intensity={1.2} distance={2.5} color="#ffd9a0" />
      </group>
      {HACKATHONS.map((h, i) => {
        const deg = -42 + i * 28
        const p = onArc(1.45, deg, 1.66)
        return (
          <Panel key={h.title} position={p} rotation={[0, facing(p[0], p[2]), 0]} width={0.32} height={0.22}>
            <group position={[-0.145, 0.088, 0]}>
              <mesh position={[0.05, -0.011, 0]}>
                <planeGeometry args={[0.1, 0.022]} />
                <meshBasicMaterial color={INK} />
              </mesh>
              <Text position={[0.05, -0.011, 0.001]} fontSize={0.0095} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.06}>
                {h.badge.toUpperCase()}
              </Text>
            </group>
            <Text position={[0.13, 0.08, 0]} fontSize={0.04} color="#ece6da" anchorX="right" anchorY="top" fontWeight="bold">
              {String(i + 1).padStart(2, '0')}
            </Text>
            <Label position={[-0.145, 0.055, 0]} size={0.022} weight="bold" maxWidth={0.29}>{h.title}</Label>
            <Label position={[-0.145, 0.018, 0]} size={0.012} color="#6b6b72" maxWidth={0.29}>{`${h.venue} · ${h.date}`}</Label>
            <Label position={[-0.145, -0.01, 0]} size={0.0135} maxWidth={0.29} color="#3a3a40">{h.story}</Label>
          </Panel>
        )
      })}
      {CERTIFICATIONS.map((c, i) => {
        const p = onArc(0.82, -24 + i * 24, 0.84)
        return (
          <Panel key={c.title} position={p} rotation={[-0.6, facing(p[0], p[2]), 0, 'YXZ']} width={0.25} height={0.1}>
            <Label position={[-0.11, 0.035, 0]} size={0.015} weight="bold" maxWidth={0.16}>{c.title}</Label>
            <Text position={[0.11, 0.035, 0]} fontSize={0.02} color={INK} anchorX="right" anchorY="top" fontWeight="bold">{c.score}</Text>
            <Label position={[-0.11, -0.012, 0]} size={0.01} color="#6b6b72" maxWidth={0.22}>{`${c.issuer} · ${c.date}`}</Label>
          </Panel>
        )
      })}
    </group>
  )
}

// ---------- 05 Contact: a sunlit corner, a card with real links ----------
export function ContactWorld({ animate, onLink }) {
  const card = [-0.1, 1.32, -1.0]
  const links = [
    ['LinkedIn', 'https://linkedin.com/in/mehanth-776892279'],
    ['GitHub', 'https://github.com/itz-mehanth'],
    ['Instagram', 'https://instagram.com/itz_mehanth'],
  ]
  return (
    <group>
      <Window scale={0.42} position={[0.95, 1.45, -1.9]} rotation={[0, -0.35, 0]} />
      <group position={[0.62, 0, -0.95]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 40]} />
          <meshStandardMaterial color="#c08c55" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.7, 12]} />
          <meshStandardMaterial color="#6e4426" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.02, 32]} />
          <meshStandardMaterial color="#6e4426" roughness={0.6} />
        </mesh>
        <group position={[0, 0.715, 0]} rotation={[0, 0.4, 0]} scale={0.11}>
          <Book size={[2.1, 0.26, 1.45]} color="#2f4a6e" position={[0, 0.13, 0]} />
          <Book size={[1.9, 0.24, 1.35]} color="#c3532f" band="#f3e3c3" position={[0.05, 0.38, 0.02]} rotation={[0, 0.09, 0]} />
          <Book size={[1.7, 0.2, 1.2]} color="#e2d6bb" band="#9a7b4f" position={[-0.06, 0.6, 0]} rotation={[0, -0.07, 0]} />
          <Mug animate={animate} position={[0.12, 0.7, 0.1]} rotation={[0, -0.6, 0]} scale={0.95} />
        </group>
      </group>
      <Plant animate={animate} position={[-0.9, 0, -1.25]} scale={0.55} />
      <Rocks position={[-1.2, 0, -0.85]} scale={0.32} />
      <Panel position={card} rotation={[0, facing(card[0], card[2]), 0]} width={0.62} height={0.46}>
        <Label position={[-0.28, 0.205, 0]} size={0.013} color="#8a7a5c" letterSpacing={0.12}>05 · CONTACT</Label>
        <Label position={[-0.28, 0.18, 0]} size={0.042} weight="bold" maxWidth={0.56}>Let&apos;s build something unforgettable.</Label>
        <Label position={[-0.28, 0.075, 0]} size={0.016} maxWidth={0.56} color="#55555c">
          Got a project, a hackathon squad, or just want to say hi? I usually reply within a day.
        </Label>
        <Label position={[-0.28, 0.02, 0]} size={0.018}>mehanth362@gmail.com</Label>
        <Label position={[-0.28, -0.012, 0]} size={0.015} color="#55555c">Bangalore, India · SWE Intern @ VISA</Label>
        <group position={[0, -0.1, 0]}>
          <Button position={[-0.2, 0, 0]} width={0.15} label="Email me" dark onPress={() => onLink('mailto:mehanth362@gmail.com')} />
          {links.map(([label, url], i) => (
            <Button key={label} position={[-0.04 + i * 0.125, 0, 0]} width={0.115} label={label} onPress={() => onLink(url)} />
          ))}
        </group>
        <Label position={[-0.28, -0.155, 0]} size={0.011} color="#8a7a5c" maxWidth={0.56}>
          Links open in your browser when you leave mixed reality.
        </Label>
      </Panel>
    </group>
  )
}

export const WORLDS = [HomeWorld, SkillsWorld, WorkWorld, AwardsWorld, ContactWorld]
