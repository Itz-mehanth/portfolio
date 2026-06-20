import React, { useRef } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useKeyboard from './utils/useKeyboard'

// Detailed stylized fighter jet, modelled nose toward -Z
// (the parent group flips Y by PI so it ends facing +Z/forward; engines at +Z face the chase camera)
function Jet({ boostRef, reverseRef, planeColor = '#eef2f7' }) {
    const body = planeColor
    const bodyMat = { color: body, metalness: 0.6, roughness: 0.26 }
    const wingColor = planeColor
    const panel = { color: '#c7d0db', metalness: 0.5, roughness: 0.35 }
    const dark = { color: '#1c2530', metalness: 0.7, roughness: 0.3 }

    // Blue-fire turbo exhaust. Tail jets fire when going forward; reverse-thrust
    // nose jets fire forward when backing up. Length/brightness ride the boost.
    const flameRefs = useRef([])      // tail (forward thrust)
    const revFlameRefs = useRef([])   // nose (reverse thrust)
    useFrame((state) => {
        const b = boostRef?.current ?? 0
        const t = state.clock.elapsedTime
        const rev = !!(reverseRef && reverseRef.current)
        const flick = 0.8 + Math.sin(t * 38) * 0.2
        const len = (0.55 + b * 2.4)
        const w = 1 + b * 0.35
        for (let i = 0; i < flameRefs.current.length; i++) {
            const g = flameRefs.current[i]; if (!g) continue
            g.visible = !rev
            g.scale.z = len * (0.8 + Math.sin(t * 38 + i * 2.1) * 0.2)
            g.scale.x = w; g.scale.y = w
        }
        for (let i = 0; i < revFlameRefs.current.length; i++) {
            const g = revFlameRefs.current[i]; if (!g) continue
            g.visible = rev
            g.scale.z = len * (0.8 + Math.sin(t * 38 + i * 2.1) * 0.2)
            g.scale.x = w; g.scale.y = w
        }
    })
    return (
        <group>
            {/* ── Fuselage ── */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.34, 0.44, 2.8, 20]} />
                <meshStandardMaterial {...bodyMat} />
            </mesh>
            {/* Dorsal spine fairing */}
            <mesh position={[0, 0.28, 0.5]}>
                <boxGeometry args={[0.3, 0.22, 1.9]} />
                <meshStandardMaterial {...panel} />
            </mesh>
            {/* Belly fuel tank */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.34, 0.4]}>
                <capsuleGeometry args={[0.16, 1.3, 4, 10]} />
                <meshStandardMaterial {...dark} />
            </mesh>

            {/* ── Nose ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.65]}>
                <coneGeometry args={[0.34, 1.3, 20]} />
                <meshStandardMaterial {...bodyMat} />
            </mesh>
            {/* Pitot probe tip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.45]}>
                <cylinderGeometry args={[0.015, 0.04, 0.5, 6]} />
                <meshStandardMaterial {...dark} />
            </mesh>
            {/* Radome band */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.15]}>
                <cylinderGeometry args={[0.345, 0.345, 0.12, 20]} />
                <meshStandardMaterial color="#9aa6b4" metalness={0.5} roughness={0.4} />
            </mesh>

            {/* ── Tail taper + nozzle housing ── */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.75]}>
                <coneGeometry args={[0.44, 0.9, 20]} />
                <meshStandardMaterial color={wingColor} metalness={0.55} roughness={0.3} />
            </mesh>

            {/* ── Cockpit ── */}
            {/* Canopy frame */}
            <mesh position={[0, 0.2, -0.78]}>
                <boxGeometry args={[0.42, 0.2, 0.95]} />
                <meshStandardMaterial {...panel} />
            </mesh>
            {/* Glass canopy */}
            <mesh position={[0, 0.27, -0.78]} rotation={[-0.22, 0, 0]}>
                <sphereGeometry args={[0.3, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <meshStandardMaterial color="#0e2a44" metalness={0.8} roughness={0.05} transparent opacity={0.8} />
            </mesh>

            {/* ── Air intakes (sides of fuselage) ── */}
            {[-1, 1].map((s) => (
                <mesh key={`in${s}`} position={[s * 0.42, -0.08, -0.2]} rotation={[0, 0, s * 0.18]}>
                    <boxGeometry args={[0.22, 0.34, 1.0]} />
                    <meshStandardMaterial {...panel} />
                </mesh>
            ))}
            {/* Intake dark mouths */}
            {[-1, 1].map((s) => (
                <mesh key={`im${s}`} position={[s * 0.42, -0.08, -0.72]}>
                    <boxGeometry args={[0.18, 0.28, 0.08]} />
                    <meshStandardMaterial color="#05070a" metalness={0.4} roughness={0.9} />
                </mesh>
            ))}

            {/* ── Canards (forward control surfaces) ── */}
            {[-1, 1].map((s) => (
                <mesh key={`cn${s}`} position={[s * 0.6, 0.02, -0.55]} rotation={[0, s * -0.35, s * 0.08]}>
                    <boxGeometry args={[0.55, 0.04, 0.34]} />
                    <meshStandardMaterial {...panel} />
                </mesh>
            ))}

            {/* ── Swept delta wings ── */}
            {[-1, 1].map((s) => (
                <group key={`wing${s}`}>
                    <mesh position={[s * 1.05, -0.05, 0.55]} rotation={[0, s * -0.2, s * 0.05]}>
                        <boxGeometry args={[1.9, 0.06, 1.3]} />
                        <meshStandardMaterial color={wingColor} metalness={0.45} roughness={0.33} />
                    </mesh>
                    {/* Gold leading-edge accent */}
                    <mesh position={[s * 1.5, -0.02, 0.18]} rotation={[0, s * -0.2, 0]}>
                        <boxGeometry args={[0.7, 0.07, 0.16]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} metalness={0.3} roughness={0.4} toneMapped={false} />
                    </mesh>
                    {/* Wingtip missile rail */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[s * 1.92, -0.03, 0.45]}>
                        <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
                        <meshStandardMaterial {...dark} />
                    </mesh>
                    {/* Missile tip */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[s * 1.92, -0.03, -0.12]}>
                        <coneGeometry args={[0.05, 0.22, 8]} />
                        <meshStandardMaterial color="#b91c1c" metalness={0.4} roughness={0.5} />
                    </mesh>
                    {/* Underwing pylon + drop tank */}
                    <mesh position={[s * 0.95, -0.16, 0.55]}>
                        <boxGeometry args={[0.08, 0.18, 0.5]} />
                        <meshStandardMaterial {...dark} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[s * 0.95, -0.32, 0.55]}>
                        <capsuleGeometry args={[0.1, 0.7, 4, 8]} />
                        <meshStandardMaterial color="#9aa6b4" metalness={0.5} roughness={0.4} />
                    </mesh>
                </group>
            ))}

            {/* ── Twin canted vertical fins ── */}
            {[-1, 1].map((s) => (
                <mesh key={`fin${s}`} position={[s * 0.3, 0.42, 1.5]} rotation={[0.3, 0, s * 0.26]}>
                    <boxGeometry args={[0.06, 0.78, 0.6]} />
                    <meshStandardMaterial color={wingColor} metalness={0.45} roughness={0.33} />
                </mesh>
            ))}
            {/* Fin gold tips */}
            {[-1, 1].map((s) => (
                <mesh key={`ft${s}`} position={[s * 0.42, 0.78, 1.55]} rotation={[0.3, 0, s * 0.26]}>
                    <boxGeometry args={[0.06, 0.16, 0.5]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} toneMapped={false} />
                </mesh>
            ))}

            {/* ── Horizontal stabilizers ── */}
            {[-1, 1].map((s) => (
                <mesh key={`hs${s}`} position={[s * 0.58, 0.04, 1.74]} rotation={[0, s * -0.12, 0]}>
                    <boxGeometry args={[0.9, 0.05, 0.52]} />
                    <meshStandardMaterial color={wingColor} metalness={0.45} roughness={0.33} />
                </mesh>
            ))}

            {/* ── Twin engine nozzles + afterburners (tail, +Z) ── */}
            {[-0.22, 0.22].map((x, i) => (
                <group key={`eng${i}`}>
                    {/* Metal nozzle ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[x, -0.05, 2.12]}>
                        <cylinderGeometry args={[0.19, 0.22, 0.3, 14]} />
                        <meshStandardMaterial color="#3a3f47" metalness={0.85} roughness={0.35} />
                    </mesh>
                    {/* Glowing afterburner core */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[x, -0.05, 2.26]}>
                        <cylinderGeometry args={[0.15, 0.15, 0.16, 14]} />
                        <meshBasicMaterial color="#27e0ff" toneMapped={false} />
                    </mesh>
                    {/* Afterburner glow halo */}
                    <mesh position={[x, -0.05, 2.4]}>
                        <sphereGeometry args={[0.34, 14, 14]} />
                        <meshBasicMaterial color="#27e0ff" transparent opacity={0.34} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
                    </mesh>
                </group>
            ))}

            {/* ── Turbo blue-fire exhaust (scales with boost) ── */}
            {[-0.22, 0.22].map((x, i) => (
                <group key={`flame${i}`} ref={(el) => { flameRefs.current[i] = el }} position={[x, -0.05, 2.46]}>
                    {/* outer blue flame */}
                    <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.2, 1.2, 18, 1, true]} />
                        <meshBasicMaterial color="#1f7bff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
                    </mesh>
                    {/* mid flame */}
                    <mesh position={[0, 0, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.13, 0.95, 16, 1, true]} />
                        <meshBasicMaterial color="#5ab0ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
                    </mesh>
                    {/* white-hot core */}
                    <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.07, 0.7, 14, 1, true]} />
                        <meshBasicMaterial color="#dff1ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                    </mesh>
                </group>
            ))}

            {/* ── Reverse-thrust blue fire (nose jets, fire FORWARD when backing up) ── */}
            {[-0.34, 0.34].map((x, i) => (
                <group key={`rflame${i}`} ref={(el) => { revFlameRefs.current[i] = el }} position={[x, -0.06, -1.55]} visible={false}>
                    <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.17, 1.1, 18, 1, true]} />
                        <meshBasicMaterial color="#1f7bff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, 0, -0.46]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.11, 0.9, 16, 1, true]} />
                        <meshBasicMaterial color="#5ab0ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, 0, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.06, 0.65, 14, 1, true]} />
                        <meshBasicMaterial color="#dff1ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                    </mesh>
                    {/* small reverse-thrust nozzle ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.12, 0.16, 12]} />
                        <meshStandardMaterial color="#3a3f47" metalness={0.85} roughness={0.35} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

// First-person cockpit interior — modelled in world units, forward = +Z.
// (Mounted on a counter-rotated, scale-compensated group so it sits world-aligned.)
function Cockpit({ planeColor = '#eef2f7', telemetry, viewRef }) {
    const sweep = useRef()
    const navled = useRef()
    const hud = useRef()
    const horizon = useRef()      // attitude indicator (center MFD)
    const ladder = useRef()       // HUD pitch ladder
    const fpm = useRef()          // HUD flight-path marker
    const headTape = useRef()     // HUD heading tape scroll
    const spdTape = useRef()      // HUD airspeed tape scroll
    const altTape = useRef()      // HUD altitude tape scroll
    const engBars = useRef([])    // right MFD engine bars
    useFrame((state) => {
        // Skip all instrument work unless we're actually inside the cockpit view
        if (viewRef && viewRef.current !== 'cockpit') return
        const t = state.clock.elapsedTime
        const tel = (telemetry && telemetry.current) || {}
        const roll = tel.roll || 0, pitch = tel.pitch || 0, spd = tel.spd || 0, boost = tel.boost || 0, z = tel.z || 0
        if (sweep.current) sweep.current.rotation.z = -t * 2.2
        if (navled.current) navled.current.material.opacity = Math.sin(t * 4) > 0 ? 0.95 : 0.25
        if (hud.current) hud.current.material.opacity = 0.13 + Math.sin(t * 2) * 0.025
        // attitude indicator: horizon counter-rolls and shifts with pitch (clamped to the screen)
        if (horizon.current) {
            horizon.current.rotation.z = -roll
            horizon.current.position.y = Math.max(-0.16, Math.min(0.16, pitch * 0.45))
        }
        // HUD pitch ladder rolls + pitches
        if (ladder.current) {
            ladder.current.rotation.z = -roll
            ladder.current.position.y = Math.max(-0.2, Math.min(0.2, pitch * 0.5))
        }
        if (fpm.current) { fpm.current.position.x = roll * 0.18; fpm.current.position.y = -pitch * 0.18 }
        // scrolling tapes (offset their texture-less tick groups)
        if (headTape.current) headTape.current.position.x = -((z * 0.02) % 0.16)
        if (spdTape.current) spdTape.current.position.y = -((spd * 1.6 + t * 0.4) % 0.12)
        if (altTape.current) altTape.current.position.y = -((z * 0.04) % 0.12)
        // engine bars pulse with throttle/boost
        engBars.current.forEach((m, i) => {
            if (!m) return
            const v = 0.35 + (0.5 + 0.5 * Math.sin(t * (2.4 + i * 0.6) + i)) * (0.45 + boost * 0.55)
            m.scale.y = v
            m.position.y = 0.16 + (v * 0.18) / 2
        })
    })
    const CY = '#27e0ff', AM = '#f4a300', GR = '#33ff99'
    const dash = { color: '#12161d', metalness: 0.55, roughness: 0.55 }
    const metal = { color: '#262b35', metalness: 0.85, roughness: 0.4 }
    const trim = { color: '#3a4150', metalness: 0.9, roughness: 0.35 }
    const scr = (c, i = 1.6) => ({ color: '#04121a', emissive: c, emissiveIntensity: i, toneMapped: false })
    const glow = (c, i = 1.4) => ({ color: c, emissive: c, emissiveIntensity: i, toneMapped: false })
    const btnRow = [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5]

    return (
        <group>
            {/* ── glare hood over the dash ── */}
            <mesh position={[0, 0.62, 1.46]} rotation={[-0.5, 0, 0]}><boxGeometry args={[2.55, 0.16, 0.55]} /><meshStandardMaterial {...metal} /></mesh>
            {/* ── main instrument console (tilted toward pilot) ── */}
            <mesh position={[0, 0.18, 1.74]} rotation={[-0.42, 0, 0]}><boxGeometry args={[2.7, 0.82, 0.62]} /><meshStandardMaterial {...dash} /></mesh>
            {/* lower console + knee panel */}
            <mesh position={[0, -0.4, 1.32]} rotation={[-0.05, 0, 0]}><boxGeometry args={[2.1, 0.8, 0.55]} /><meshStandardMaterial {...dash} /></mesh>

            {/* ════ three LIVE MFD displays ════ */}
            {/* screen bezels */}
            {[-0.74, 0, 0.74].map((x, i) => (
                <mesh key={`bez${i}`} position={[x, 0.3, 1.5]} rotation={[-0.42, 0, 0]}><boxGeometry args={[i === 1 ? 0.74 : 0.7, i === 1 ? 0.56 : 0.52, 0.04]} /><meshStandardMaterial color="#05080d" metalness={0.6} roughness={0.5} /></mesh>
            ))}

            {/* LEFT MFD — RADAR */}
            <mesh position={[-0.74, 0.3, 1.52]} rotation={[-0.42, 0, 0]}><planeGeometry args={[0.62, 0.44]} /><meshStandardMaterial {...scr('#052')} /></mesh>
            <group position={[-0.74, 0.305, 1.54]} rotation={[-0.42, 0, 0]}>
                <mesh><ringGeometry args={[0.18, 0.193, 28]} /><meshBasicMaterial color={GR} transparent opacity={0.5} toneMapped={false} /></mesh>
                <mesh><ringGeometry args={[0.1, 0.108, 24]} /><meshBasicMaterial color={GR} transparent opacity={0.38} toneMapped={false} /></mesh>
                {[0, 1, 2, 3].map((i) => (<mesh key={i} rotation={[0, 0, i * Math.PI / 4]}><planeGeometry args={[0.38, 0.004]} /><meshBasicMaterial color={GR} transparent opacity={0.18} toneMapped={false} /></mesh>))}
                <group ref={sweep}><mesh position={[0.09, 0, 0.001]}><planeGeometry args={[0.18, 0.02]} /><meshBasicMaterial color="#aaffdd" toneMapped={false} transparent opacity={0.85} /></mesh></group>
                <mesh ref={navled} position={[0.05, 0.06, 0.002]}><circleGeometry args={[0.016, 10]} /><meshBasicMaterial color="#ff4d4d" toneMapped={false} transparent opacity={0.9} /></mesh>
                <mesh position={[-0.08, -0.04, 0.002]}><circleGeometry args={[0.012, 8]} /><meshBasicMaterial color={AM} toneMapped={false} transparent opacity={0.8} /></mesh>
            </group>

            {/* CENTER MFD — ATTITUDE INDICATOR (live) */}
            <mesh position={[0, 0.3, 1.52]} rotation={[-0.42, 0, 0]}><planeGeometry args={[0.66, 0.48]} /><meshStandardMaterial {...scr('#0a1622', 0.8)} /></mesh>
            <group position={[0, 0.3, 1.53]} rotation={[-0.42, 0, 0]}>
                {/* rolling horizon ball (clamped visually by the bezel) */}
                <group ref={horizon}>
                    <mesh position={[0, 0.22, 0]}><planeGeometry args={[0.9, 0.5]} /><meshBasicMaterial color="#1f6dd6" toneMapped={false} /></mesh>
                    <mesh position={[0, -0.22, 0]}><planeGeometry args={[0.9, 0.5]} /><meshBasicMaterial color="#6b4a2a" toneMapped={false} /></mesh>
                    <mesh position={[0, 0, 0.001]}><planeGeometry args={[0.9, 0.01]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
                    {[-0.12, -0.06, 0.06, 0.12].map((y, i) => (<mesh key={i} position={[0, y, 0.001]}><planeGeometry args={[0.16, 0.006]} /><meshBasicMaterial color="#dfeaff" transparent opacity={0.7} toneMapped={false} /></mesh>))}
                </group>
                {/* fixed aircraft reference */}
                <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.12, 0.012]} /><meshBasicMaterial color={AM} toneMapped={false} /></mesh>
                <mesh position={[-0.09, 0, 0.01]}><planeGeometry args={[0.05, 0.012]} /><meshBasicMaterial color={AM} toneMapped={false} /></mesh>
                <mesh position={[0.09, 0, 0.01]}><planeGeometry args={[0.05, 0.012]} /><meshBasicMaterial color={AM} toneMapped={false} /></mesh>
                {/* bezel ring to frame/clip the ball */}
                <mesh position={[0, 0, 0.012]}><ringGeometry args={[0.22, 0.34, 36]} /><meshBasicMaterial color="#05080d" toneMapped={false} side={THREE.DoubleSide} /></mesh>
            </group>

            {/* RIGHT MFD — ENGINE / SYSTEMS bars (live) */}
            <mesh position={[0.74, 0.3, 1.52]} rotation={[-0.42, 0, 0]}><planeGeometry args={[0.62, 0.44]} /><meshStandardMaterial {...scr('#04121a')} /></mesh>
            <group position={[0.74, 0.16, 1.54]} rotation={[-0.42, 0, 0]}>
                {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
                    <group key={i} position={[x, 0, 0]}>
                        <mesh position={[0, 0.09, 0]}><boxGeometry args={[0.06, 0.26, 0.004]} /><meshBasicMaterial color="#0a2230" toneMapped={false} /></mesh>
                        <mesh ref={(el) => { engBars.current[i] = el }} position={[0, 0.16, 0.002]}><boxGeometry args={[0.05, 0.18, 0.005]} /><meshBasicMaterial color={i < 2 ? GR : AM} toneMapped={false} /></mesh>
                    </group>
                ))}
            </group>

            {/* screen labels */}
            <Text position={[-0.74, 0.52, 1.45]} rotation={[-0.42, 0, 0]} fontSize={0.05} color={GR} anchorX="center" anchorY="middle">RDR</Text>
            <Text position={[0, 0.54, 1.45]} rotation={[-0.42, 0, 0]} fontSize={0.05} color={CY} anchorX="center" anchorY="middle">ADI</Text>
            <Text position={[0.74, 0.52, 1.45]} rotation={[-0.42, 0, 0]} fontSize={0.05} color={AM} anchorX="center" anchorY="middle">ENG</Text>

            {/* button rows + knobs along the console lip */}
            {btnRow.map((x, i) => (
                <mesh key={`b${i}`} position={[x, -0.08, 1.42]} rotation={[-0.42, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.03, 12]} /><meshStandardMaterial {...glow(i % 2 ? AM : CY, 1.2)} /></mesh>
            ))}
            {[-0.95, 0.95].map((x, i) => (
                <mesh key={`k${i}`} position={[x, 0.05, 1.5]} rotation={[-0.42, 0, 0]}><cylinderGeometry args={[0.07, 0.08, 0.08, 16]} /><meshStandardMaterial {...trim} /></mesh>
            ))}

            {/* ── control stick ── */}
            <mesh position={[0, -0.62, 1.0]}><cylinderGeometry args={[0.12, 0.16, 0.12, 16]} /><meshStandardMaterial {...metal} /></mesh>
            <mesh position={[0, -0.32, 1.0]}><cylinderGeometry args={[0.035, 0.045, 0.55, 12]} /><meshStandardMaterial {...trim} /></mesh>
            <mesh position={[0, -0.02, 1.0]}><boxGeometry args={[0.16, 0.18, 0.12]} /><meshStandardMaterial color="#1a1f28" metalness={0.6} roughness={0.5} /></mesh>
            <mesh position={[0, 0.06, 1.06]}><sphereGeometry args={[0.03, 10, 8]} /><meshStandardMaterial {...glow('#ff4d4d', 1.4)} /></mesh>

            {/* ── throttle quadrant (left) ── */}
            <mesh position={[-1.18, -0.25, 1.25]}><boxGeometry args={[0.3, 0.22, 0.5]} /><meshStandardMaterial {...metal} /></mesh>
            <mesh position={[-1.18, -0.02, 1.15]} rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.4, 10]} /><meshStandardMaterial {...trim} /></mesh>
            <mesh position={[-1.18, 0.16, 1.0]}><sphereGeometry args={[0.06, 12, 10]} /><meshStandardMaterial {...glow(CY, 1.0)} /></mesh>

            {/* ── side consoles ── */}
            {[-1, 1].map((s) => (
                <group key={`sc${s}`} position={[s * 1.25, -0.05, 1.5]} rotation={[0, s * -0.5, 0]}>
                    <mesh><boxGeometry args={[0.5, 0.6, 0.7]} /><meshStandardMaterial {...dash} /></mesh>
                    {[-0.12, 0.0, 0.12].map((y, i) => (
                        <mesh key={i} position={[0, y, 0.36]}><boxGeometry args={[0.28, 0.05, 0.02]} /><meshStandardMaterial {...glow(i === 1 ? AM : CY, 1.0)} /></mesh>
                    ))}
                </group>
            ))}

            {/* ── canopy frame (arches + rails you look through) ── */}
            <mesh position={[0, 1.28, 0.92]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.92, 0.05, 8, 24, Math.PI]} /><meshStandardMaterial {...metal} /></mesh>
            {[-1, 1].map((s) => (
                <mesh key={`rail${s}`} position={[s * 0.9, 0.75, 0.1]} rotation={[0.32, 0, s * 0.06]}><boxGeometry args={[0.07, 0.07, 2.0]} /><meshStandardMaterial {...metal} /></mesh>
            ))}
            {/* center spine bar */}
            <mesh position={[0, 1.42, -0.2]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.06, 0.06, 1.6]} /><meshStandardMaterial {...trim} /></mesh>
            {/* windscreen lower frame */}
            <mesh position={[0, 0.72, 1.18]} rotation={[-0.5, 0, 0]}><boxGeometry args={[1.9, 0.06, 0.06]} /><meshStandardMaterial {...trim} /></mesh>

            {/* ════ full HUD projected on the glass (green symbology, lives with telemetry) ════ */}
            <group position={[0, 1.02, 1.34]}>
                {(() => {
                    const HG = '#7dffb4'
                    const line = (w, h, x = 0, y = 0, o = 0.9) => (
                        <mesh position={[x, y, 0.001]}><planeGeometry args={[w, h]} /><meshBasicMaterial color={HG} toneMapped={false} transparent opacity={o} depthWrite={false} /></mesh>
                    )
                    return (
                        <>
                            {/* faint glass */}
                            <mesh ref={hud}><planeGeometry args={[1.25, 0.78]} /><meshBasicMaterial color={HG} transparent opacity={0.12} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} /></mesh>

                            {/* fixed boresight */}
                            {line(0.05, 0.01, 0, 0)}{line(0.01, 0.05, 0, 0)}

                            {/* flight-path marker (drifts with roll/pitch) */}
                            <group ref={fpm}>
                                <mesh><ringGeometry args={[0.028, 0.034, 20]} /><meshBasicMaterial color={HG} toneMapped={false} transparent opacity={0.95} depthWrite={false} /></mesh>
                                {line(0.05, 0.008, -0.058, 0)}{line(0.05, 0.008, 0.058, 0)}{line(0.008, 0.03, 0, 0.05)}
                            </group>

                            {/* pitch ladder (rolls + pitches) */}
                            <group ref={ladder}>
                                {[-0.2, -0.1, 0.1, 0.2].map((y, i) => (
                                    <group key={i} position={[0, y, 0]}>
                                        {line(0.12, 0.008, -0.12, 0, 0.8)}{line(0.12, 0.008, 0.12, 0, 0.8)}
                                        {line(0.008, 0.03, -0.18, y > 0 ? -0.012 : 0.012, 0.7)}{line(0.008, 0.03, 0.18, y > 0 ? -0.012 : 0.012, 0.7)}
                                    </group>
                                ))}
                            </group>

                            {/* heading tape (top, scrolls) */}
                            <group position={[0, 0.33, 0]}>
                                {line(0.7, 0.012, 0, 0, 0.5)}
                                <group ref={headTape}>
                                    {Array.from({ length: 11 }, (_, i) => line(0.006, 0.03, -0.4 + i * 0.16, 0, 0.7))}
                                </group>
                                {line(0.012, 0.05, 0, -0.03, 0.95)}
                            </group>

                            {/* airspeed tape (left, scrolls) + box */}
                            <group position={[-0.52, 0, 0]}>
                                <mesh><planeGeometry args={[0.13, 0.46]} /><meshBasicMaterial color={HG} transparent opacity={0.07} toneMapped={false} depthWrite={false} /></mesh>
                                <group ref={spdTape}>
                                    {Array.from({ length: 11 }, (_, i) => line(0.05, 0.006, 0.02, -0.24 + i * 0.12, 0.7))}
                                </group>
                                {line(0.13, 0.012, 0, 0.06, 0.95)}{line(0.13, 0.012, 0, -0.06, 0.95)}
                                <Text position={[0, 0.28, 0]} fontSize={0.045} color={HG} anchorX="center" anchorY="middle">SPD</Text>
                            </group>

                            {/* altitude tape (right, scrolls) + box */}
                            <group position={[0.52, 0, 0]}>
                                <mesh><planeGeometry args={[0.13, 0.46]} /><meshBasicMaterial color={HG} transparent opacity={0.07} toneMapped={false} depthWrite={false} /></mesh>
                                <group ref={altTape}>
                                    {Array.from({ length: 11 }, (_, i) => line(0.05, 0.006, -0.02, -0.24 + i * 0.12, 0.7))}
                                </group>
                                {line(0.13, 0.012, 0, 0.06, 0.95)}{line(0.13, 0.012, 0, -0.06, 0.95)}
                                <Text position={[0, 0.28, 0]} fontSize={0.045} color={HG} anchorX="center" anchorY="middle">ALT</Text>
                            </group>

                            {/* bank arc (top) */}
                            {[-0.5, -0.25, 0, 0.25, 0.5].map((a, i) => (
                                <mesh key={i} position={[Math.sin(a) * 0.42, 0.42 + Math.cos(a) * 0.0, 0.001]} rotation={[0, 0, -a]}><planeGeometry args={[0.006, 0.03]} /><meshBasicMaterial color={HG} toneMapped={false} transparent opacity={0.7} depthWrite={false} /></mesh>
                            ))}
                        </>
                    )
                })()}
            </group>

            {/* ── interior lighting (only live while the cockpit group is visible) ── */}
            <pointLight position={[0, 0.4, 1.3]} intensity={0.7} color={CY} distance={3.2} decay={2} />
            <pointLight position={[0, 1.0, 0.2]} intensity={0.45} color="#ffd9b0" distance={4} decay={2} />
            <pointLight position={[0, 0.2, 0.2]} intensity={0.3} color={AM} distance={3} decay={2} />

            {/* ── tinted canopy glass (see-through; subtle reflection/tint) ── */}
            <mesh position={[0, 0.9, 0.5]} scale={[1.05, 0.95, 1.4]}>
                <sphereGeometry args={[1.15, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color="#9fd8ff" metalness={0.2} roughness={0.05} transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {/* canopy reflection streak */}
            <mesh position={[-0.35, 1.25, 0.9]} rotation={[0, 0, 0.5]}>
                <planeGeometry args={[0.06, 0.9]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.05} toneMapped={false} depthWrite={false} />
            </mesh>

            

            {/* ====== realism structure: tub ====== */}
            <group>
  {/* === FLOOR PLATE === */}
  <mesh position={[0, -0.98, 0.625]} receiveShadow>
    <boxGeometry args={[2.0, 0.04, 2.65]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.1} />
  </mesh>

  {/* === LEFT SIDE WALL (main angled panel) === */}
  <mesh position={[-0.95, 0.22, 0.625]} rotation={[0, 0, 0.08]}>
    <boxGeometry args={[0.06, 2.45, 2.65]} />
    <meshStandardMaterial color="#0f1218" roughness={0.85} metalness={0.15} />
  </mesh>

  {/* === RIGHT SIDE WALL (main angled panel) === */}
  <mesh position={[0.95, 0.22, 0.625]} rotation={[0, 0, -0.08]}>
    <boxGeometry args={[0.06, 2.45, 2.65]} />
    <meshStandardMaterial color="#0f1218" roughness={0.85} metalness={0.15} />
  </mesh>

  {/* === LEFT SIDE WALL — recessed seam panel A === */}
  <mesh position={[-0.923, 0.45, 0.2]}>
    <boxGeometry args={[0.008, 0.55, 0.85]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* === LEFT SIDE WALL — recessed seam panel B === */}
  <mesh position={[-0.923, -0.2, 0.9]}>
    <boxGeometry args={[0.008, 0.40, 0.65]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* === RIGHT SIDE WALL — recessed seam panel A === */}
  <mesh position={[0.923, 0.45, 0.2]}>
    <boxGeometry args={[0.008, 0.55, 0.85]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* === RIGHT SIDE WALL — recessed seam panel B === */}
  <mesh position={[0.923, -0.2, 0.9]}>
    <boxGeometry args={[0.008, 0.40, 0.65]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* === LEFT KICK PANEL (lower rudder area) === */}
  <mesh position={[-0.82, -0.72, 1.6]} rotation={[0.12, 0, 0.05]}>
    <boxGeometry args={[0.28, 0.32, 0.22]} />
    <meshStandardMaterial color="#14181f" roughness={0.88} metalness={0.12} />
  </mesh>

  {/* === RIGHT KICK PANEL (lower rudder area) === */}
  <mesh position={[0.82, -0.72, 1.6]} rotation={[0.12, 0, -0.05]}>
    <boxGeometry args={[0.28, 0.32, 0.22]} />
    <meshStandardMaterial color="#14181f" roughness={0.88} metalness={0.12} />
  </mesh>

  {/* === LEFT LOWER FORWARD SIDE WALL === */}
  <mesh position={[-0.88, -0.38, 1.55]} rotation={[0, 0, 0.06]}>
    <boxGeometry args={[0.10, 0.62, 0.72]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.1} />
  </mesh>

  {/* === RIGHT LOWER FORWARD SIDE WALL === */}
  <mesh position={[0.88, -0.38, 1.55]} rotation={[0, 0, -0.06]}>
    <boxGeometry args={[0.10, 0.62, 0.72]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.1} />
  </mesh>

  {/* === COAMING LIP — center bar across dash top === */}
  <mesh position={[0, 0.665, 1.26]}>
    <boxGeometry args={[1.6, 0.025, 0.06]} />
    <meshStandardMaterial color="#3a4150" roughness={0.75} metalness={0.35} />
  </mesh>

  {/* === COAMING LIP — left angled end === */}
  <mesh position={[-0.72, 0.66, 1.22]} rotation={[0, 0.22, 0]}>
    <boxGeometry args={[0.22, 0.022, 0.06]} />
    <meshStandardMaterial color="#3a4150" roughness={0.75} metalness={0.35} />
  </mesh>

  {/* === COAMING LIP — right angled end === */}
  <mesh position={[0.72, 0.66, 1.22]} rotation={[0, -0.22, 0]}>
    <boxGeometry args={[0.22, 0.022, 0.06]} />
    <meshStandardMaterial color="#3a4150" roughness={0.75} metalness={0.35} />
  </mesh>

  {/* === COAMING LIP — rear trim strip === */}
  <mesh position={[0, 0.655, 1.21]}>
    <boxGeometry args={[1.55, 0.012, 0.025]} />
    <meshStandardMaterial color="#262b35" roughness={0.7} metalness={0.4} />
  </mesh>

  {/* ============================================================
      EJECTION SEAT — centered at x=0, z≈-0.35
      ============================================================ */}

  {/* Seat pan */}
  <mesh position={[0, -0.55, -0.28]}>
    <boxGeometry args={[0.62, 0.07, 0.52]} />
    <meshStandardMaterial color="#1a1d24" roughness={0.88} metalness={0.08} />
  </mesh>

  {/* Seat pan front lip */}
  <mesh position={[0, -0.60, 0.0]} rotation={[0.28, 0, 0]}>
    <boxGeometry args={[0.58, 0.05, 0.08]} />
    <meshStandardMaterial color="#14181f" roughness={0.88} metalness={0.08} />
  </mesh>

  {/* Backrest main */}
  <mesh position={[0, 0.28, -0.52]} rotation={[-0.06, 0, 0]}>
    <boxGeometry args={[0.58, 1.72, 0.10]} />
    <meshStandardMaterial color="#1a1d24" roughness={0.88} metalness={0.08} />
  </mesh>

  {/* Backrest internal cushion strip */}
  <mesh position={[0, 0.22, -0.465]} rotation={[-0.06, 0, 0]}>
    <boxGeometry args={[0.42, 1.30, 0.018]} />
    <meshStandardMaterial color="#14181f" roughness={0.92} metalness={0.04} />
  </mesh>

  {/* Headrest box */}
  <mesh position={[0, 1.18, -0.50]} rotation={[-0.06, 0, 0]}>
    <boxGeometry args={[0.34, 0.22, 0.16]} />
    <meshStandardMaterial color="#1a1d24" roughness={0.85} metalness={0.12} />
  </mesh>

  {/* Headrest top metal cap */}
  <mesh position={[0, 1.30, -0.50]}>
    <boxGeometry args={[0.36, 0.028, 0.17]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.65} />
  </mesh>

  {/* Left side bolster */}
  <mesh position={[-0.34, -0.15, -0.35]} rotation={[0, 0, -0.12]}>
    <boxGeometry args={[0.10, 0.72, 0.44]} />
    <meshStandardMaterial color="#1a1d24" roughness={0.88} metalness={0.08} />
  </mesh>

  {/* Right side bolster */}
  <mesh position={[0.34, -0.15, -0.35]} rotation={[0, 0, 0.12]}>
    <boxGeometry args={[0.10, 0.72, 0.44]} />
    <meshStandardMaterial color="#1a1d24" roughness={0.88} metalness={0.08} />
  </mesh>

  {/* === HARNESS STRAPS — 5-point === */}

  {/* Left shoulder strap — from top-left backrest down to chest buckle */}
  <mesh position={[-0.16, 0.52, -0.18]} rotation={[0.52, 0.08, -0.18]}>
    <boxGeometry args={[0.055, 0.72, 0.018]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.05} />
  </mesh>

  {/* Right shoulder strap */}
  <mesh position={[0.16, 0.52, -0.18]} rotation={[0.52, -0.08, 0.18]}>
    <boxGeometry args={[0.055, 0.72, 0.018]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.05} />
  </mesh>

  {/* Left lap strap */}
  <mesh position={[-0.18, -0.25, -0.02]} rotation={[-0.38, 0.05, 0.22]}>
    <boxGeometry args={[0.050, 0.52, 0.018]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.05} />
  </mesh>

  {/* Right lap strap */}
  <mesh position={[0.18, -0.25, -0.02]} rotation={[-0.38, -0.05, -0.22]}>
    <boxGeometry args={[0.050, 0.52, 0.018]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.05} />
  </mesh>

  {/* Crotch (anti-submarine) strap */}
  <mesh position={[0, -0.30, 0.02]} rotation={[-0.55, 0, 0]}>
    <boxGeometry args={[0.048, 0.46, 0.018]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.05} />
  </mesh>

  {/* Central buckle block */}
  <mesh position={[0, 0.08, 0.04]}>
    <boxGeometry args={[0.095, 0.072, 0.028]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.70} />
  </mesh>

  {/* Buckle face plate */}
  <mesh position={[0, 0.08, 0.056]}>
    <boxGeometry args={[0.072, 0.052, 0.006]} />
    <meshStandardMaterial color="#3a4150" roughness={0.45} metalness={0.80} />
  </mesh>

  {/* Left shoulder strap adjuster buckle */}
  <mesh position={[-0.17, 0.65, -0.42]}>
    <boxGeometry args={[0.065, 0.030, 0.022]} />
    <meshStandardMaterial color="#262b35" roughness={0.50} metalness={0.72} />
  </mesh>

  {/* Right shoulder strap adjuster buckle */}
  <mesh position={[0.17, 0.65, -0.42]}>
    <boxGeometry args={[0.065, 0.030, 0.022]} />
    <meshStandardMaterial color="#262b35" roughness={0.50} metalness={0.72} />
  </mesh>

  {/* === SEAT STRUCTURE — side rails (metal) === */}

  {/* Left seat rail */}
  <mesh position={[-0.33, -0.30, -0.35]}>
    <boxGeometry args={[0.035, 1.10, 0.048]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.68} />
  </mesh>

  {/* Right seat rail */}
  <mesh position={[0.33, -0.30, -0.35]}>
    <boxGeometry args={[0.035, 1.10, 0.048]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.68} />
  </mesh>

  {/* Seat pan cross brace front */}
  <mesh position={[0, -0.60, -0.06]}>
    <boxGeometry args={[0.64, 0.028, 0.032]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.68} />
  </mesh>

  {/* Seat pan cross brace rear */}
  <mesh position={[0, -0.60, -0.52]}>
    <boxGeometry args={[0.64, 0.028, 0.032]} />
    <meshStandardMaterial color="#262b35" roughness={0.55} metalness={0.68} />
  </mesh>

  {/* === REAR WALL / TUB BACK === */}
  <mesh position={[0, 0.18, -0.68]}>
    <boxGeometry args={[2.0, 2.30, 0.055]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.1} />
  </mesh>

  {/* Rear wall panel seam left */}
  <mesh position={[-0.52, 0.30, -0.652]}>
    <boxGeometry args={[0.008, 1.20, 0.012]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* Rear wall panel seam right */}
  <mesh position={[0.52, 0.30, -0.652]}>
    <boxGeometry args={[0.008, 1.20, 0.012]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* Rear wall horizontal seam */}
  <mesh position={[0, 0.60, -0.651]}>
    <boxGeometry args={[1.98, 0.008, 0.012]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* === TUB SIDE LOWER CORNER FILLETS === */}

  {/* Left forward lower fillet block */}
  <mesh position={[-0.86, -0.78, 0.8]} rotation={[0, 0, 0.35]}>
    <boxGeometry args={[0.12, 0.22, 1.80]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.08} />
  </mesh>

  {/* Right forward lower fillet block */}
  <mesh position={[0.86, -0.78, 0.8]} rotation={[0, 0, -0.35]}>
    <boxGeometry args={[0.12, 0.22, 1.80]} />
    <meshStandardMaterial color="#0f1218" roughness={0.9} metalness={0.08} />
  </mesh>

  {/* === CANOPY RAIL STRIP left === */}
  <mesh position={[-0.88, 1.36, 0.50]} rotation={[0, 0, 0.06]}>
    <boxGeometry args={[0.055, 0.040, 2.20]} />
    <meshStandardMaterial color="#3a4150" roughness={0.60} metalness={0.55} />
  </mesh>

  {/* === CANOPY RAIL STRIP right === */}
  <mesh position={[0.88, 1.36, 0.50]} rotation={[0, 0, -0.06]}>
    <boxGeometry args={[0.055, 0.040, 2.20]} />
    <meshStandardMaterial color="#3a4150" roughness={0.60} metalness={0.55} />
  </mesh>

  {/* === FOOTWELL / RUDDER PED RECESS === */}
  <mesh position={[0, -0.90, 1.78]}>
    <boxGeometry args={[0.82, 0.14, 0.28]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.95} metalness={0.05} />
  </mesh>

  {/* Footwell left side trim */}
  <mesh position={[-0.38, -0.84, 1.78]}>
    <boxGeometry args={[0.048, 0.10, 0.26]} />
    <meshStandardMaterial color="#14181f" roughness={0.88} metalness={0.10} />
  </mesh>

  {/* Footwell right side trim */}
  <mesh position={[0.38, -0.84, 1.78]}>
    <boxGeometry args={[0.048, 0.10, 0.26]} />
    <meshStandardMaterial color="#14181f" roughness={0.88} metalness={0.10} />
  </mesh>
</group>

            {/* ====== realism structure: canopy ====== */}
            <group>
  {/* Front windscreen arch frame — thicker bow at z≈1.15 spanning the windscreen top */}
  <mesh position={[0, 1.22, 1.13]}>
    <boxGeometry args={[1.52, 0.045, 0.055]} />
    <meshStandardMaterial color="#262b35" metalness={0.82} roughness={0.28} flatShading />
  </mesh>
  {/* Left vertical windscreen arch pillar */}
  <mesh position={[-0.74, 1.17, 1.1]} rotation={[0.18, 0, 0.08]}>
    <boxGeometry args={[0.048, 0.14, 0.048]} />
    <meshStandardMaterial color="#262b35" metalness={0.82} roughness={0.28} flatShading />
  </mesh>
  {/* Right vertical windscreen arch pillar */}
  <mesh position={[0.74, 1.17, 1.1]} rotation={[0.18, 0, -0.08]}>
    <boxGeometry args={[0.048, 0.14, 0.048]} />
    <meshStandardMaterial color="#262b35" metalness={0.82} roughness={0.28} flatShading />
  </mesh>

  {/* Left longitudinal canopy bow — runs front to back at x≈-0.70 */}
  <mesh position={[-0.70, 1.48, 0.35]} rotation={[0.04, 0, 0]}>
    <boxGeometry args={[0.038, 0.038, 2.1]} />
    <meshStandardMaterial color="#262b35" metalness={0.80} roughness={0.30} flatShading />
  </mesh>
  {/* Left bow slight arch — raise center segment */}
  <mesh position={[-0.70, 1.56, 0.2]}>
    <boxGeometry args={[0.036, 0.036, 0.7]} />
    <meshStandardMaterial color="#262b35" metalness={0.80} roughness={0.30} flatShading />
  </mesh>

  {/* Right longitudinal canopy bow — runs front to back at x≈+0.70 */}
  <mesh position={[0.70, 1.48, 0.35]} rotation={[0.04, 0, 0]}>
    <boxGeometry args={[0.038, 0.038, 2.1]} />
    <meshStandardMaterial color="#262b35" metalness={0.80} roughness={0.30} flatShading />
  </mesh>
  {/* Right bow slight arch — raise center segment */}
  <mesh position={[0.70, 1.56, 0.2]}>
    <boxGeometry args={[0.036, 0.036, 0.7]} />
    <meshStandardMaterial color="#262b35" metalness={0.80} roughness={0.30} flatShading />
  </mesh>

  {/* Center-rear longitudinal bow — spine along the crown */}
  <mesh position={[0, 1.72, 0.12]} rotation={[0.02, 0, 0]}>
    <boxGeometry args={[0.040, 0.040, 2.2]} />
    <meshStandardMaterial color="#3a4150" metalness={0.75} roughness={0.35} flatShading />
  </mesh>

  {/* Cross-bow mid-canopy — lateral structural rib over pilot head */}
  <mesh position={[0, 1.60, 0.30]}>
    <boxGeometry args={[1.42, 0.034, 0.034]} />
    <meshStandardMaterial color="#262b35" metalness={0.78} roughness={0.32} flatShading />
  </mesh>

  {/* Cross-bow rear — aft structural rib */}
  <mesh position={[0, 1.55, -0.40]}>
    <boxGeometry args={[1.44, 0.032, 0.032]} />
    <meshStandardMaterial color="#262b35" metalness={0.78} roughness={0.32} flatShading />
  </mesh>

  {/* ── RIVETS along front windscreen arch ── */}
  {[-0.60, -0.40, -0.20, 0.0, 0.20, 0.40, 0.60].map((x, i) => (
    <mesh key={`warch-rivet-${i}`} position={[x, 1.246, 1.112]}>
      <sphereGeometry args={[0.0085, 5, 5]} />
      <meshStandardMaterial color="#3a4150" metalness={0.9} roughness={0.2} flatShading />
    </mesh>
  ))}

  {/* ── RIVETS along left longitudinal bow ── */}
  {[-0.62, -0.20, 0.18, 0.56, 0.94].map((z, i) => (
    <mesh key={`lbow-rivet-${i}`} position={[-0.718, 1.495, z]}>
      <sphereGeometry args={[0.0078, 5, 5]} />
      <meshStandardMaterial color="#3a4150" metalness={0.9} roughness={0.2} flatShading />
    </mesh>
  ))}

  {/* ── RIVETS along right longitudinal bow ── */}
  {[-0.62, -0.20, 0.18, 0.56, 0.94].map((z, i) => (
    <mesh key={`rbow-rivet-${i}`} position={[0.718, 1.495, z]}>
      <sphereGeometry args={[0.0078, 5, 5]} />
      <meshStandardMaterial color="#3a4150" metalness={0.9} roughness={0.2} flatShading />
    </mesh>
  ))}

  {/* ── RIVETS along center spine bow ── */}
  {[-0.50, -0.10, 0.28, 0.65].map((z, i) => (
    <mesh key={`cbow-rivet-${i}`} position={[0, 1.742, z]}>
      <sphereGeometry args={[0.0080, 5, 5]} />
      <meshStandardMaterial color="#3a4150" metalness={0.9} roughness={0.2} flatShading />
    </mesh>
  ))}

  {/* ── RIVETS along mid cross-bow ── */}
  {[-0.55, -0.28, 0, 0.28, 0.55].map((x, i) => (
    <mesh key={`midxbow-rivet-${i}`} position={[x, 1.618, 0.30]}>
      <sphereGeometry args={[0.0076, 5, 5]} />
      <meshStandardMaterial color="#3a4150" metalness={0.9} roughness={0.2} flatShading />
    </mesh>
  ))}

  {/* ── REAR-VIEW MIRROR assembly ~(0, 1.50, 1.02) ── */}
  {/* Mirror stalk vertical */}
  <mesh position={[0, 1.42, 1.02]}>
    <cylinderGeometry args={[0.008, 0.008, 0.10, 7]} />
    <meshStandardMaterial color="#3a4150" metalness={0.85} roughness={0.25} flatShading />
  </mesh>
  {/* Mirror stalk horizontal arm */}
  <mesh position={[0, 1.47, 1.02]} rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[0.007, 0.007, 0.06, 7]} />
    <meshStandardMaterial color="#3a4150" metalness={0.85} roughness={0.25} flatShading />
  </mesh>
  {/* Mirror housing — angled down ~30° toward pilot */}
  <mesh position={[0, 1.495, 1.016]} rotation={[-0.52, 0, 0]}>
    <boxGeometry args={[0.072, 0.008, 0.048]} />
    <meshStandardMaterial color="#1a1e28" metalness={0.95} roughness={0.05} flatShading />
  </mesh>
  {/* Mirror reflective face */}
  <mesh position={[0, 1.498, 1.013]} rotation={[-0.52, 0, 0]}>
    <boxGeometry args={[0.066, 0.003, 0.042]} />
    <meshStandardMaterial color="#b8c8d8" metalness={1.0} roughness={0.04} flatShading />
  </mesh>
  {/* Mirror mount bracket — small pad on windscreen arch */}
  <mesh position={[0, 1.228, 1.126]}>
    <boxGeometry args={[0.055, 0.018, 0.030]} />
    <meshStandardMaterial color="#14181f" metalness={0.75} roughness={0.40} flatShading />
  </mesh>

  {/* ── CANOPY LATCH HOOKS — left rail near front ── */}
  <mesh position={[-0.68, 1.20, 0.92]}>
    <boxGeometry args={[0.030, 0.050, 0.022]} />
    <meshStandardMaterial color="#3a4150" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  <mesh position={[-0.68, 1.196, 0.88]} rotation={[0, 0, -0.35]}>
    <boxGeometry args={[0.012, 0.040, 0.018]} />
    <meshStandardMaterial color="#262b35" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  {/* Latch bolt */}
  <mesh position={[-0.69, 1.206, 0.92]}>
    <cylinderGeometry args={[0.007, 0.007, 0.024, 6]} rotation_order="XYZ" />
    <meshStandardMaterial color="#3a4150" metalness={0.92} roughness={0.18} flatShading />
  </mesh>

  {/* ── CANOPY LATCH HOOKS — right rail near front ── */}
  <mesh position={[0.68, 1.20, 0.92]}>
    <boxGeometry args={[0.030, 0.050, 0.022]} />
    <meshStandardMaterial color="#3a4150" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  <mesh position={[0.68, 1.196, 0.88]} rotation={[0, 0, 0.35]}>
    <boxGeometry args={[0.012, 0.040, 0.018]} />
    <meshStandardMaterial color="#262b35" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  {/* Latch bolt */}
  <mesh position={[0.69, 1.206, 0.92]}>
    <cylinderGeometry args={[0.007, 0.007, 0.024, 6]} />
    <meshStandardMaterial color="#3a4150" metalness={0.92} roughness={0.18} flatShading />
  </mesh>

  {/* ── CANOPY LATCH HOOKS — left rail mid ── */}
  <mesh position={[-0.68, 1.20, 0.10]}>
    <boxGeometry args={[0.030, 0.050, 0.022]} />
    <meshStandardMaterial color="#3a4150" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  <mesh position={[-0.69, 1.206, 0.10]}>
    <cylinderGeometry args={[0.007, 0.007, 0.024, 6]} />
    <meshStandardMaterial color="#3a4150" metalness={0.92} roughness={0.18} flatShading />
  </mesh>

  {/* ── CANOPY LATCH HOOKS — right rail mid ── */}
  <mesh position={[0.68, 1.20, 0.10]}>
    <boxGeometry args={[0.030, 0.050, 0.022]} />
    <meshStandardMaterial color="#3a4150" metalness={0.88} roughness={0.22} flatShading />
  </mesh>
  <mesh position={[0.69, 1.206, 0.10]}>
    <cylinderGeometry args={[0.007, 0.007, 0.024, 6]} />
    <meshStandardMaterial color="#3a4150" metalness={0.92} roughness={0.18} flatShading />
  </mesh>

  {/* ── CANOPY RAIL EDGES — left and right low rail strip ── */}
  <mesh position={[-0.715, 1.18, 0.30]}>
    <boxGeometry args={[0.022, 0.020, 1.80]} />
    <meshStandardMaterial color="#14181f" metalness={0.72} roughness={0.45} flatShading />
  </mesh>
  <mesh position={[0.715, 1.18, 0.30]}>
    <boxGeometry args={[0.022, 0.020, 1.80]} />
    <meshStandardMaterial color="#14181f" metalness={0.72} roughness={0.45} flatShading />
  </mesh>

  {/* ── RUBBER SEAL STRIP — left rail ── */}
  <mesh position={[-0.726, 1.175, 0.30]}>
    <boxGeometry args={[0.010, 0.012, 1.78]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.0} flatShading />
  </mesh>
  {/* ── RUBBER SEAL STRIP — right rail ── */}
  <mesh position={[0.726, 1.175, 0.30]}>
    <boxGeometry args={[0.010, 0.012, 1.78]} />
    <meshStandardMaterial color="#2a2117" roughness={0.92} metalness={0.0} flatShading />
  </mesh>
</group>

            {/* ====== realism structure: placards ====== */}
            <group>
  {/* Lower console placards */}
  {/* MASTER ARM placard - amber */}
  <group position={[-0.28, 0.31, 1.48]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.11, 0.035, 0.002]} />
      <meshStandardMaterial color="#2a1a00" roughness={0.7} />
    </mesh>
    <Text fontSize={0.028} color="#f4a300" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      MASTER ARM
    </Text>
  </group>

  {/* EJECT placard - red */}
  <group position={[0.28, 0.29, 1.51]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.08, 0.033, 0.002]} />
      <meshStandardMaterial color="#2a0000" roughness={0.7} />
    </mesh>
    <Text fontSize={0.028} color="#ff4d4d" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      EJECT
    </Text>
  </group>

  {/* FUEL placard */}
  <group position={[-0.18, 0.22, 1.55]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.075, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      FUEL
    </Text>
  </group>

  {/* O2 placard */}
  <group position={[0.18, 0.22, 1.55]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.06, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      O2
    </Text>
  </group>

  {/* RDR placard */}
  <group position={[0.08, 0.35, 1.44]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.065, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      RDR
    </Text>
  </group>

  {/* CAUTION placard - amber */}
  <group position={[-0.08, 0.35, 1.44]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.085, 0.03, 0.002]} />
      <meshStandardMaterial color="#1f1200" roughness={0.7} />
    </mesh>
    <Text fontSize={0.026} color="#f4a300" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      CAUTION
    </Text>
  </group>

  {/* TRIM placard */}
  <group position={[-0.38, 0.14, 1.58]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.07, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      TRIM
    </Text>
  </group>

  {/* A/P placard */}
  <group position={[0.38, 0.14, 1.58]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.065, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      A/P
    </Text>
  </group>

  {/* Data plate - MK-III serial */}
  <group position={[0.0, 0.06, 1.59]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.14, 0.038, 0.002]} />
      <meshStandardMaterial color="#14181f" roughness={0.6} metalness={0.3} />
    </mesh>
    <Text fontSize={0.018} color="#5a7080" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      MK-III // AVATAR-01
    </Text>
  </group>

  {/* DANGER placard near left side */}
  <group position={[-0.46, 0.18, 1.52]} rotation={[-0.46, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.09, 0.032, 0.002]} />
      <meshStandardMaterial color="#2a0000" roughness={0.7} />
    </mesh>
    <Text fontSize={0.026} color="#ff4d4d" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      DANGER
    </Text>
  </group>

  {/* Left side console placards */}
  {/* COMM placard on left console */}
  <group position={[-1.1, 0.3, 1.5]} rotation={[0, Math.PI / 2, 0]}>
    <mesh>
      <boxGeometry args={[0.09, 0.032, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      COMM
    </Text>
  </group>

  {/* IFF placard on left console */}
  <group position={[-1.1, 0.2, 1.38]} rotation={[0, Math.PI / 2, 0]}>
    <mesh>
      <boxGeometry args={[0.065, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      IFF
    </Text>
  </group>

  {/* Right side console placards */}
  {/* ECS placard on right console */}
  <group position={[1.1, 0.3, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
    <mesh>
      <boxGeometry args={[0.065, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      ECS
    </Text>
  </group>

  {/* ELX placard on right console */}
  <group position={[1.1, 0.2, 1.38]} rotation={[0, -Math.PI / 2, 0]}>
    <mesh>
      <boxGeometry args={[0.065, 0.03, 0.002]} />
      <meshStandardMaterial color="#0f1218" roughness={0.8} />
    </mesh>
    <Text fontSize={0.026} color="#6f8aa0" anchorX="center" anchorY="middle" position={[0, 0, 0.002]}>
      ELX
    </Text>
  </group>

  {/* Panel seam lines on lower console */}
  {/* Horizontal seam across dash */}
  <mesh position={[0, 0.265, 1.5]} rotation={[-0.46, 0, 0]}>
    <boxGeometry args={[0.95, 0.003, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Vertical seam center dash */}
  <mesh position={[0, 0.19, 1.54]} rotation={[-0.46, 0, 0]}>
    <boxGeometry args={[0.003, 0.22, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Vertical seam left of center */}
  <mesh position={[-0.32, 0.19, 1.54]} rotation={[-0.46, 0, 0]}>
    <boxGeometry args={[0.003, 0.22, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Vertical seam right of center */}
  <mesh position={[0.32, 0.19, 1.54]} rotation={[-0.46, 0, 0]}>
    <boxGeometry args={[0.003, 0.22, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Seam on left tub wall */}
  <mesh position={[-1.08, 0.25, 1.45]} rotation={[0, Math.PI / 2, 0]}>
    <boxGeometry args={[0.28, 0.003, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Seam on right tub wall */}
  <mesh position={[1.08, 0.25, 1.45]} rotation={[0, -Math.PI / 2, 0]}>
    <boxGeometry args={[0.28, 0.003, 0.002]} />
    <meshStandardMaterial color="#0a0c11" roughness={0.9} />
  </mesh>

  {/* Screw rows along lower console top edge */}
  {[-0.44, -0.33, -0.22, -0.11, 0.0, 0.11, 0.22, 0.33, 0.44].map((x, i) => (
    <mesh key={`screw-top-${i}`} position={[x, 0.385, 1.41]} rotation={[-0.46, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}

  {/* Screw rows along lower console bottom edge */}
  {[-0.44, -0.33, -0.22, -0.11, 0.0, 0.11, 0.22, 0.33, 0.44].map((x, i) => (
    <mesh key={`screw-bot-${i}`} position={[x, 0.04, 1.62]} rotation={[-0.46, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}

  {/* Screws along left side console edge */}
  {[1.3, 1.45, 1.6, 1.75].map((z, i) => (
    <mesh key={`screw-left-${i}`} position={[-1.06, 0.08, z]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}

  {/* Screws along right side console edge */}
  {[1.3, 1.45, 1.6, 1.75].map((z, i) => (
    <mesh key={`screw-right-${i}`} position={[1.06, 0.08, z]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}

  {/* Screws left edge vertical run on dash */}
  {[0.08, 0.18, 0.28, 0.36].map((y, i) => (
    <mesh key={`screw-dleft-${i}`} position={[-0.48, y, 1.53]} rotation={[-0.46, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}

  {/* Screws right edge vertical run on dash */}
  {[0.08, 0.18, 0.28, 0.36].map((y, i) => (
    <mesh key={`screw-dright-${i}`} position={[0.48, y, 1.53]} rotation={[-0.46, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.006, 6]} />
      <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.6} />
    </mesh>
  ))}
</group>

            {/* hull-color trim strip on the dash so your finish shows inside too */}
            <mesh position={[0, 0.56, 1.52]} rotation={[-0.5, 0, 0]}><boxGeometry args={[2.5, 0.04, 0.04]} /><meshStandardMaterial color={planeColor} metalness={0.6} roughness={0.3} /></mesh>

            {/* ====== detailed panel: left ====== */}
            <group position={[-1.23, 0.15, 1.45]} rotation={[0, 0, 0.18]}>
  {/* Console base surface — angled toward pilot */}
  <mesh position={[0, 0, 0]} rotation={[0.18, 0, 0]}>
    <boxGeometry args={[0.72, 0.06, 0.92]} />
    <meshStandardMaterial color="#12161d" />
  </mesh>

  {/* Console raised back panel */}
  <mesh position={[0, 0.18, 0.38]}>
    <boxGeometry args={[0.72, 0.38, 0.08]} />
    <meshStandardMaterial color="#12161d" />
  </mesh>

  {/* === THROTTLE QUADRANT BASE === */}
  <mesh position={[0.08, 0.06, -0.12]}>
    <boxGeometry args={[0.32, 0.08, 0.46]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  {/* Throttle track groove left */}
  <mesh position={[0.0, 0.09, -0.12]}>
    <boxGeometry args={[0.04, 0.03, 0.4]} />
    <meshStandardMaterial color="#0c0e13" />
  </mesh>

  {/* Throttle track groove right */}
  <mesh position={[0.16, 0.09, -0.12]}>
    <boxGeometry args={[0.04, 0.03, 0.4]} />
    <meshStandardMaterial color="#0c0e13" />
  </mesh>

  {/* Throttle lever 1 — left, mid position */}
  <group position={[0.0, 0.14, -0.05]} rotation={[-0.52, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    {/* Grip knob top */}
    <mesh position={[0, 0.18, 0]}>
      <boxGeometry args={[0.06, 0.07, 0.1]} />
      <meshStandardMaterial color="#15171c" />
    </mesh>
    {/* Grip button on knob */}
    <mesh position={[0, 0.19, -0.055]}>
      <cylinderGeometry args={[0.012, 0.012, 0.012, 8]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    {/* Finger ridge */}
    <mesh position={[0, 0.12, 0.035]}>
      <boxGeometry args={[0.07, 0.012, 0.012]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
  </group>

  {/* Throttle lever 2 — right, slightly forward */}
  <group position={[0.16, 0.14, -0.09]} rotation={[-0.42, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    {/* Grip knob top */}
    <mesh position={[0, 0.18, 0]}>
      <boxGeometry args={[0.06, 0.07, 0.1]} />
      <meshStandardMaterial color="#15171c" />
    </mesh>
    {/* Grip button */}
    <mesh position={[0, 0.19, -0.055]}>
      <cylinderGeometry args={[0.012, 0.012, 0.012, 8]} />
      <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.12, 0.035]}>
      <boxGeometry args={[0.07, 0.012, 0.012]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
  </group>

  {/* THROT label */}
  <Text fontSize={0.04} color="#8fb3c7" anchorX="center" anchorY="middle" position={[0.08, 0.065, 0.1]} rotation={[-Math.PI / 2 + 0.18, 0, 0]}>
    THROT
  </Text>

  {/* === FLAP LEVER QUADRANT === */}
  <mesh position={[-0.22, 0.06, -0.08]}>
    <boxGeometry args={[0.14, 0.07, 0.38]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  {/* Flap quadrant notch marks */}
  {[0.1, 0.03, -0.04, -0.11, -0.14].map((z, i) => (
    <mesh key={i} position={[-0.16, 0.065, z]}>
      <boxGeometry args={[0.012, 0.01, 0.008]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
  ))}

  {/* Flap lever arm */}
  <group position={[-0.22, 0.1, 0.06]} rotation={[-0.28, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.013, 0.013, 0.28, 8]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    <mesh position={[0, 0.155, 0]}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshStandardMaterial color="#15171c" />
    </mesh>
  </group>

  {/* FLAP label */}
  <Text fontSize={0.036} color="#8fb3c7" anchorX="center" anchorY="middle" position={[-0.22, 0.065, 0.16]} rotation={[-Math.PI / 2 + 0.18, 0, 0]}>
    FLAP
  </Text>

  {/* === LANDING GEAR LEVER === */}
  <mesh position={[-0.22, 0.07, 0.28]}>
    <boxGeometry args={[0.13, 0.08, 0.14]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  {/* Gear lever shaft */}
  <group position={[-0.22, 0.14, 0.3]} rotation={[-0.35, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    {/* Wheel-shaped knob: torus */}
    <mesh position={[0, 0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.026, 0.008, 8, 16]} />
      <meshStandardMaterial color="#15171c" />
    </mesh>
    {/* Wheel spokes */}
    <mesh position={[0, 0.115, 0]}>
      <cylinderGeometry args={[0.003, 0.003, 0.052, 6]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    <mesh position={[0, 0.115, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.003, 0.003, 0.052, 6]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
  </group>

  {/* GEAR label */}
  <Text fontSize={0.034} color="#8fb3c7" anchorX="center" anchorY="middle" position={[-0.22, 0.065, 0.38]} rotation={[-Math.PI / 2 + 0.18, 0, 0]}>
    GEAR
  </Text>

  {/* Gear down indicator LED */}
  <mesh position={[-0.22, 0.075, 0.22]}>
    <cylinderGeometry args={[0.009, 0.009, 0.008, 8]} />
    <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>

  {/* === GUARDED TOGGLE SWITCH BANK === */}
  {/* 5 guarded toggles in a row along the back panel */}
  {[0, 1, 2, 3, 4].map((i) => {
    const xPos = -0.28 + i * 0.14;
    const isLit = i === 1 || i === 3;
    const litColor = i === 1 ? "#27e0ff" : "#f4a300";
    return (
      <group key={i} position={[xPos, 0.19, 0.33]}>
        {/* Guard box */}
        <mesh position={[0, 0.038, 0]}>
          <boxGeometry args={[0.036, 0.055, 0.04]} />
          <meshStandardMaterial color="#262b35" transparent opacity={0.82} />
        </mesh>
        {/* Guard hinge */}
        <mesh position={[0, 0.058, 0.018]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.034, 6]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#3a4150" />
        </mesh>
        {/* Toggle lever */}
        <mesh position={[0, 0.022, 0]} rotation={[0.22, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.038, 6]} />
          <meshStandardMaterial color={isLit ? litColor : "#3a4150"} emissive={isLit ? litColor : "#000000"} emissiveIntensity={isLit ? 1.2 : 0} toneMapped={false} />
        </mesh>
        {/* Toggle base plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.038, 0.008, 0.042]} />
          <meshStandardMaterial color="#12161d" />
        </mesh>
        {/* LED indicator */}
        <mesh position={[0, 0.005, -0.026]}>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshStandardMaterial color={isLit ? litColor : "#0c0e13"} emissive={isLit ? litColor : "#000000"} emissiveIntensity={isLit ? 1.5 : 0} toneMapped={false} />
        </mesh>
      </group>
    );
  })}

  {/* === ROTARY KNOBS === */}
  {/* Knob 1 */}
  <group position={[-0.26, 0.1, 0.18]}>
    <mesh>
      <cylinderGeometry args={[0.028, 0.032, 0.028, 12]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    {/* pointer notch */}
    <mesh position={[0.024, 0.016, 0]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.006, 0.014, 0.006]} />
      <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    {/* knurling rings */}
    {[-0.008, 0, 0.008].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <torusGeometry args={[0.031, 0.002, 6, 14]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
    ))}
  </group>

  {/* Knob 2 */}
  <group position={[-0.08, 0.1, 0.18]}>
    <mesh>
      <cylinderGeometry args={[0.028, 0.032, 0.028, 12]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    <mesh position={[0, 0.016, -0.025]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.006, 0.006, 0.014]} />
      <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    {[-0.008, 0, 0.008].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <torusGeometry args={[0.031, 0.002, 6, 14]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
    ))}
  </group>

  {/* Knob 3 */}
  <group position={[0.08, 0.1, 0.18]}>
    <mesh>
      <cylinderGeometry args={[0.024, 0.028, 0.022, 12]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    <mesh position={[-0.022, 0.012, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <boxGeometry args={[0.005, 0.012, 0.005]} />
      <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    {[-0.006, 0.006].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <torusGeometry args={[0.027, 0.002, 6, 14]} />
        <meshStandardMaterial color="#3a4150" />
      </mesh>
    ))}
  </group>

  {/* === MISC SMALL ROCKER SWITCHES === */}
  <mesh position={[0.2, 0.1, 0.12]}>
    <boxGeometry args={[0.028, 0.014, 0.042]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  <mesh position={[0.2, 0.115, 0.1]}>
    <boxGeometry args={[0.022, 0.016, 0.016]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  <mesh position={[0.2, 0.1, 0.2]}>
    <boxGeometry args={[0.028, 0.014, 0.042]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  <mesh position={[0.2, 0.115, 0.18]}>
    <boxGeometry args={[0.022, 0.016, 0.016]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  {/* Small indicator LED cluster */}
  {[0, 1, 2].map((i) => (
    <mesh key={i} position={[0.2 + i * 0.018, 0.075, 0.35]}>
      <sphereGeometry args={[0.006, 6, 6]} />
      <meshStandardMaterial
        color={i === 0 ? "#33ff99" : i === 1 ? "#f4a300" : "#ff4d4d"}
        emissive={i === 0 ? "#33ff99" : i === 1 ? "#f4a300" : "#ff4d4d"}
        emissiveIntensity={1.2}
        toneMapped={false}
      />
    </mesh>
  ))}

  {/* Trim wheel rim */}
  <mesh position={[-0.27, 0.09, -0.3]} rotation={[0, 0, Math.PI / 2]}>
    <torusGeometry args={[0.046, 0.01, 8, 18]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>
  <mesh position={[-0.27, 0.09, -0.3]} rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[0.004, 0.004, 0.092, 6]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  <mesh position={[-0.27, 0.09, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.004, 0.004, 0.092, 6]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>

  {/* Small push-button rows */}
  {[0, 1, 2, 3].map((i) => (
    <mesh key={i} position={[0.1 + i * 0.045, 0.075, -0.28]}>
      <cylinderGeometry args={[0.01, 0.01, 0.016, 8]} />
      <meshStandardMaterial
        color={i === 2 ? "#27e0ff" : "#262b35"}
        emissive={i === 2 ? "#27e0ff" : "#000000"}
        emissiveIntensity={i === 2 ? 1.2 : 0}
        toneMapped={false}
      />
    </mesh>
  ))}

  {/* Console side lip */}
  <mesh position={[0.34, 0.02, 0]}>
    <boxGeometry args={[0.04, 0.06, 0.92]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>
  <mesh position={[-0.34, 0.02, 0]}>
    <boxGeometry args={[0.04, 0.06, 0.92]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>

  {/* Wrist rest rubber pad */}
  <mesh position={[0.08, 0.06, 0.38]}>
    <boxGeometry args={[0.28, 0.018, 0.11]} />
    <meshStandardMaterial color="#15171c" roughness={1} />
  </mesh>
</group>

            {/* ====== detailed panel: right ====== */}
            <group position={[1.235, 0.15, 1.45]} rotation={[0.18, -0.38, 0.04]}>
  {/* Main console panel surface */}
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[0.72, 0.78, 0.035]} />
    <meshStandardMaterial color="#12161d" roughness={0.85} metalness={0.3} />
  </mesh>

  {/* Panel bevel/frame */}
  <mesh position={[0, 0, -0.02]}>
    <boxGeometry args={[0.76, 0.82, 0.015]} />
    <meshStandardMaterial color="#262b35" roughness={0.7} metalness={0.5} />
  </mesh>

  {/* COMM sub-screen */}
  <mesh position={[-0.04, 0.27, 0.02]}>
    <boxGeometry args={[0.38, 0.14, 0.008]} />
    <meshStandardMaterial color="#04121a" emissive="#f4a300" emissiveIntensity={1.5} toneMapped={false} />
  </mesh>
  {/* Screen border */}
  <mesh position={[-0.04, 0.27, 0.015]}>
    <boxGeometry args={[0.4, 0.16, 0.005]} />
    <meshStandardMaterial color="#3a4150" roughness={0.6} metalness={0.6} />
  </mesh>
  {/* Frequency tick marks on screen */}
  <mesh position={[-0.14, 0.27, 0.026]}>
    <boxGeometry args={[0.005, 0.07, 0.003]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[-0.04, 0.27, 0.026]}>
    <boxGeometry args={[0.005, 0.09, 0.003]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[0.06, 0.27, 0.026]}>
    <boxGeometry args={[0.005, 0.07, 0.003]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[0.14, 0.27, 0.026]}>
    <boxGeometry args={[0.005, 0.05, 0.003]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>

  {/* COMM label */}
  <Text fontSize={0.038} color="#f4a300" anchorX="center" anchorY="middle" position={[-0.04, 0.365, 0.025]}>
    COMM
  </Text>

  {/* 3x3 grid of rocker/push buttons */}
  {/* Row 1 */}
  <mesh position={[-0.18, 0.1, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[-0.04, 0.1, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.4} />
  </mesh>
  <mesh position={[0.1, 0.1, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  {/* Row 2 */}
  <mesh position={[-0.18, 0.025, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.4} />
  </mesh>
  <mesh position={[-0.04, 0.025, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[0.1, 0.025, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.4} />
  </mesh>
  {/* Row 3 */}
  <mesh position={[-0.18, -0.05, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[-0.04, -0.05, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.4} />
  </mesh>
  <mesh position={[0.1, -0.05, 0.024]}>
    <boxGeometry args={[0.07, 0.055, 0.012]} />
    <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>

  {/* Button recesses/borders */}
  {[-0.18, -0.04, 0.1].map((x, i) =>
    [0.1, 0.025, -0.05].map((y, j) => (
      <mesh key={`btn-border-${i}-${j}`} position={[x, y, 0.018]}>
        <boxGeometry args={[0.075, 0.06, 0.006]} />
        <meshStandardMaterial color="#0c0e13" roughness={0.9} />
      </mesh>
    ))
  )}

  {/* 3 Rotary dials */}
  {/* Dial 1 - base plate */}
  <mesh position={[-0.2, -0.155, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.055, 0.055, 0.01, 24]} />
    <meshStandardMaterial color="#0c0e13" roughness={0.9} />
  </mesh>
  {/* Dial 1 - knob */}
  <mesh position={[-0.2, -0.155, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.038, 0.04, 0.022, 18]} />
    <meshStandardMaterial color="#3a4150" roughness={0.4} metalness={0.7} />
  </mesh>
  {/* Dial 1 - pointer */}
  <mesh position={[-0.2, -0.133, 0.056]}>
    <boxGeometry args={[0.005, 0.018, 0.004]} />
    <meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  {/* Dial 1 - tick ring torus */}
  <mesh position={[-0.2, -0.155, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[0.053, 0.003, 6, 28]} />
    <meshStandardMaterial color="#3a4150" roughness={0.5} metalness={0.6} />
  </mesh>
  {/* Dial 1 ticks */}
  {[0, 1, 2, 3, 4, 5, 6, 7].map((t) => (
    <mesh key={`d1t-${t}`} position={[-0.2 + Math.sin((t / 8) * Math.PI * 2) * 0.053, -0.155 + Math.cos((t / 8) * Math.PI * 2) * 0.053, 0.028]} rotation={[0, 0, (t / 8) * Math.PI * 2]}>
      <boxGeometry args={[0.003, 0.009, 0.003]} />
      <meshStandardMaterial color="#8fb3c7" roughness={0.6} />
    </mesh>
  ))}

  {/* Dial 2 */}
  <mesh position={[0.0, -0.155, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.055, 0.055, 0.01, 24]} />
    <meshStandardMaterial color="#0c0e13" roughness={0.9} />
  </mesh>
  <mesh position={[0.0, -0.155, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.038, 0.04, 0.022, 18]} />
    <meshStandardMaterial color="#3a4150" roughness={0.4} metalness={0.7} />
  </mesh>
  <mesh position={[0.022, -0.147, 0.056]}>
    <boxGeometry args={[0.018, 0.005, 0.004]} />
    <meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[0.0, -0.155, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[0.053, 0.003, 6, 28]} />
    <meshStandardMaterial color="#3a4150" roughness={0.5} metalness={0.6} />
  </mesh>
  {[0, 1, 2, 3, 4, 5, 6, 7].map((t) => (
    <mesh key={`d2t-${t}`} position={[0.0 + Math.sin((t / 8) * Math.PI * 2) * 0.053, -0.155 + Math.cos((t / 8) * Math.PI * 2) * 0.053, 0.028]} rotation={[0, 0, (t / 8) * Math.PI * 2]}>
      <boxGeometry args={[0.003, 0.009, 0.003]} />
      <meshStandardMaterial color="#8fb3c7" roughness={0.6} />
    </mesh>
  ))}

  {/* Dial 3 */}
  <mesh position={[0.2, -0.155, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.055, 0.055, 0.01, 24]} />
    <meshStandardMaterial color="#0c0e13" roughness={0.9} />
  </mesh>
  <mesh position={[0.2, -0.155, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.038, 0.04, 0.022, 18]} />
    <meshStandardMaterial color="#3a4150" roughness={0.4} metalness={0.7} />
  </mesh>
  <mesh position={[0.2, -0.175, 0.056]}>
    <boxGeometry args={[0.005, 0.018, 0.004]} />
    <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh position={[0.2, -0.155, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[0.053, 0.003, 6, 28]} />
    <meshStandardMaterial color="#3a4150" roughness={0.5} metalness={0.6} />
  </mesh>
  {[0, 1, 2, 3, 4, 5, 6, 7].map((t) => (
    <mesh key={`d3t-${t}`} position={[0.2 + Math.sin((t / 8) * Math.PI * 2) * 0.053, -0.155 + Math.cos((t / 8) * Math.PI * 2) * 0.053, 0.028]} rotation={[0, 0, (t / 8) * Math.PI * 2]}>
      <boxGeometry args={[0.003, 0.009, 0.003]} />
      <meshStandardMaterial color="#8fb3c7" roughness={0.6} />
    </mesh>
  ))}

  {/* Circuit breaker column - right side */}
  {[0, 1, 2, 3, 4].map((i) => (
    <group key={`cb-${i}`} position={[0.3, 0.16 - i * 0.075, 0.024]}>
      {/* CB base */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.012, 12]} />
        <meshStandardMaterial color="#262b35" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* CB pin */}
      <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.022, 10]} />
        <meshStandardMaterial color={i === 2 ? "#ff4d4d" : "#dff1ff"} emissive={i === 2 ? "#ff4d4d" : "#dff1ff"} emissiveIntensity={i === 2 ? 1.5 : 0.6} toneMapped={false} />
      </mesh>
    </group>
  ))}

  {/* Toggle switches column */}
  {[0, 1, 2, 3].map((i) => (
    <group key={`tgl-${i}`} position={[-0.31, 0.14 - i * 0.085, 0.024]}>
      {/* Switch base */}
      <mesh>
        <boxGeometry args={[0.022, 0.032, 0.01]} />
        <meshStandardMaterial color="#15171c" roughness={0.9} />
      </mesh>
      {/* Switch lever - alternating up/down */}
      <mesh position={[0, i % 2 === 0 ? 0.022 : -0.022, 0.016]} rotation={[i % 2 === 0 ? -0.5 : 0.5, 0, 0]}>
        <boxGeometry args={[0.009, 0.038, 0.009]} />
        <meshStandardMaterial color="#3a4150" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Guard cover (open) */}
      <mesh position={[0, 0.04, 0.01]} rotation={[-1.1, 0, 0]}>
        <boxGeometry args={[0.026, 0.028, 0.004]} />
        <meshStandardMaterial color="#262b35" roughness={0.6} metalness={0.4} transparent opacity={0.85} />
      </mesh>
    </group>
  ))}

  {/* Indicator LEDs strip */}
  {[0, 1, 2, 3, 4].map((i) => (
    <mesh key={`led-${i}`} position={[-0.12 + i * 0.06, -0.255, 0.024]}>
      <boxGeometry args={[0.018, 0.012, 0.008]} />
      <meshStandardMaterial
        color={["#27e0ff", "#33ff99", "#f4a300", "#ff4d4d", "#33ff99"][i]}
        emissive={["#27e0ff", "#33ff99", "#f4a300", "#ff4d4d", "#33ff99"][i]}
        emissiveIntensity={1.2}
        toneMapped={false}
      />
    </mesh>
  ))}

  {/* PWR label */}
  <Text fontSize={0.033} color="#8fb3c7" anchorX="center" anchorY="middle" position={[0.3, 0.255, 0.025]}>
    PWR
  </Text>

  {/* Separation grooves */}
  <mesh position={[0, 0.21, 0.021]}>
    <boxGeometry args={[0.7, 0.003, 0.004]} />
    <meshStandardMaterial color="#0c0e13" />
  </mesh>
  <mesh position={[0, -0.115, 0.021]}>
    <boxGeometry args={[0.7, 0.003, 0.004]} />
    <meshStandardMaterial color="#0c0e13" />
  </mesh>
  <mesh position={[0, -0.215, 0.021]}>
    <boxGeometry args={[0.7, 0.003, 0.004]} />
    <meshStandardMaterial color="#0c0e13" />
  </mesh>

  {/* Small rocker switches near top */}
  {[-0.22, -0.06, 0.1, 0.24].map((x, i) => (
    <group key={`rck-${i}`} position={[x, 0.185, 0.024]}>
      <mesh>
        <boxGeometry args={[0.035, 0.016, 0.008]} />
        <meshStandardMaterial color="#0c0e13" roughness={0.9} />
      </mesh>
      <mesh position={[-0.01, 0, 0.007]}>
        <boxGeometry args={[0.014, 0.013, 0.006]} />
        <meshStandardMaterial color={i === 1 ? "#27e0ff" : "#3a4150"} emissive={i === 1 ? "#27e0ff" : undefined} emissiveIntensity={i === 1 ? 1.2 : 0} toneMapped={false} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.01, 0, 0.007]}>
        <boxGeometry args={[0.014, 0.013, 0.006]} />
        <meshStandardMaterial color={i === 3 ? "#33ff99" : "#262b35"} emissive={i === 3 ? "#33ff99" : undefined} emissiveIntensity={i === 3 ? 1.2 : 0} toneMapped={false} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  ))}
</group>

            {/* ====== detailed panel: center ====== */}
            <group>
  {/* ── CONTROL STICK TOP DETAIL cluster around (0, 0.05, 1.0) ── */}
  <group position={[0, 0.05, 1.0]}>
    {/* Grip body cap */}
    <mesh position={[0, 0.04, 0]}>
      <cylinderGeometry args={[0.038, 0.042, 0.08, 12]} />
      <meshStandardMaterial color="#15171c" roughness={0.85} />
    </mesh>

    {/* TRIGGER — front lower face */}
    <mesh position={[0, -0.01, 0.04]} rotation={[0.45, 0, 0]}>
      <boxGeometry args={[0.022, 0.014, 0.018]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.7} />
    </mesh>
    {/* Trigger pivot nub */}
    <mesh position={[0, -0.018, 0.048]} rotation={[0.45, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.022, 6]} />
      <meshStandardMaterial color="#3a4150" metalness={0.6} roughness={0.4} />
    </mesh>

    {/* RED GUARDED FIRE BUTTON — top front */}
    {/* Guard hinge bar */}
    <mesh position={[0, 0.072, 0.028]}>
      <boxGeometry args={[0.028, 0.005, 0.004]} />
      <meshStandardMaterial color="#3a4150" metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Guard flip cover (closed position, slightly open angle) */}
    <mesh position={[0, 0.072, 0.018]} rotation={[-0.35, 0, 0]}>
      <boxGeometry args={[0.026, 0.004, 0.022]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    {/* Red fire button */}
    <mesh position={[0, 0.078, 0.02]}>
      <cylinderGeometry args={[0.007, 0.007, 0.006, 8]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>

    {/* HAT SWITCH — top center */}
    {/* Base */}
    <mesh position={[0, 0.092, 0.005]}>
      <boxGeometry args={[0.024, 0.006, 0.024]} />
      <meshStandardMaterial color="#12161d" roughness={0.9} />
    </mesh>
    {/* Hat center post */}
    <mesh position={[0, 0.1, 0.005]}>
      <cylinderGeometry args={[0.004, 0.004, 0.012, 6]} />
      <meshStandardMaterial color="#15171c" roughness={0.85} />
    </mesh>
    {/* Hat up */}
    <mesh position={[0, 0.103, -0.006]}>
      <boxGeometry args={[0.006, 0.004, 0.006]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.8} />
    </mesh>
    {/* Hat down */}
    <mesh position={[0, 0.103, 0.016]}>
      <boxGeometry args={[0.006, 0.004, 0.006]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.8} />
    </mesh>
    {/* Hat left */}
    <mesh position={[-0.011, 0.103, 0.005]}>
      <boxGeometry args={[0.006, 0.004, 0.006]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.8} />
    </mesh>
    {/* Hat right */}
    <mesh position={[0.011, 0.103, 0.005]}>
      <boxGeometry args={[0.006, 0.004, 0.006]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.8} />
    </mesh>

    {/* THUMB BUTTON LEFT — lit cyan */}
    <mesh position={[-0.032, 0.06, 0.01]}>
      <cylinderGeometry args={[0.006, 0.006, 0.007, 8]} />
      <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
    {/* Thumb button right — lit amber */}
    <mesh position={[0.032, 0.06, 0.01]}>
      <cylinderGeometry args={[0.006, 0.006, 0.007, 8]} />
      <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  </group>

  {/* ── CENTER PEDESTAL BLOCK around (0, -0.45, 1.25) ── */}
  <group position={[0, -0.45, 1.25]}>
    {/* Main pedestal body */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.38, 0.52, 0.26]} />
      <meshStandardMaterial color="#12161d" roughness={0.85} />
    </mesh>
    {/* Top face bevel trim */}
    <mesh position={[0, 0.262, 0]}>
      <boxGeometry args={[0.39, 0.006, 0.27]} />
      <meshStandardMaterial color="#3a4150" metalness={0.5} roughness={0.4} />
    </mesh>
    {/* Side trim left */}
    <mesh position={[-0.192, 0, 0]}>
      <boxGeometry args={[0.005, 0.52, 0.26]} />
      <meshStandardMaterial color="#3a4150" metalness={0.4} roughness={0.5} />
    </mesh>
    {/* Side trim right */}
    <mesh position={[0.192, 0, 0]}>
      <boxGeometry args={[0.005, 0.52, 0.26]} />
      <meshStandardMaterial color="#3a4150" metalness={0.4} roughness={0.5} />
    </mesh>

    {/* ── Pedestal top face panel — switches and screens ── */}
    {/* Two small MFD-style screens recessed into top */}
    {/* Screen left */}
    <mesh position={[-0.08, 0.268, -0.04]}>
      <boxGeometry args={[0.1, 0.003, 0.08]} />
      <meshStandardMaterial color="#04121a" emissive="#27e0ff" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    <Text
      position={[-0.08, 0.272, -0.04]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.018}
      color="#27e0ff"
      anchorX="center"
      anchorY="middle"
    >NAV</Text>
    {/* Screen right */}
    <mesh position={[0.08, 0.268, -0.04]}>
      <boxGeometry args={[0.1, 0.003, 0.08]} />
      <meshStandardMaterial color="#04121a" emissive="#f4a300" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    <Text
      position={[0.08, 0.272, -0.04]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.018}
      color="#f4a300"
      anchorX="center"
      anchorY="middle"
    >SYS</Text>

    {/* Row of 5 toggle switches on top face */}
    {[-0.16, -0.08, 0, 0.08, 0.16].map((x, i) => (
      <group key={i} position={[x, 0.268, 0.07]}>
        {/* Switch base */}
        <mesh>
          <boxGeometry args={[0.018, 0.003, 0.022]} />
          <meshStandardMaterial color="#1a1e26" roughness={0.8} />
        </mesh>
        {/* Toggle lever */}
        <mesh position={[0, 0.012, i % 2 === 0 ? -0.005 : 0.005]} rotation={[i % 2 === 0 ? -0.4 : 0.4, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.02, 6]} />
          <meshStandardMaterial color="#3a4150" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* LED indicator */}
        <mesh position={[0, 0.005, -0.013]}>
          <sphereGeometry args={[0.003, 6, 6]} />
          <meshStandardMaterial
            color={i === 0 ? "#33ff99" : i === 3 ? "#ff4d4d" : "#f4a300"}
            emissive={i === 0 ? "#33ff99" : i === 3 ? "#ff4d4d" : "#f4a300"}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    ))}

    {/* ── Front face of pedestal — row of rocker switches and rotary dials ── */}
    {/* Rocker switch row — 4 switches */}
    {[-0.135, -0.045, 0.045, 0.135].map((x, i) => (
      <group key={i} position={[x, 0.09, 0.132]}>
        {/* Rocker body */}
        <mesh>
          <boxGeometry args={[0.04, 0.022, 0.006]} />
          <meshStandardMaterial color="#1a1e26" roughness={0.8} />
        </mesh>
        {/* Rocker pivot ridge */}
        <mesh position={[0, 0, 0.004]}>
          <cylinderGeometry args={[0.002, 0.002, 0.038, 6]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#3a4150" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* LED top side */}
        <mesh position={[0, 0.013, 0.003]}>
          <boxGeometry args={[0.012, 0.004, 0.004]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#27e0ff" : "#33ff99"}
            emissive={i % 2 === 0 ? "#27e0ff" : "#33ff99"}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    ))}

    {/* Rotary dial left */}
    <mesh position={[-0.13, -0.06, 0.132]}>
      <cylinderGeometry args={[0.026, 0.026, 0.012, 14]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#262b35" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[-0.13, -0.06, 0.139]}>
      <cylinderGeometry args={[0.018, 0.018, 0.003, 14]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    {/* Dial pointer */}
    <mesh position={[-0.13, -0.044, 0.14]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.002, 0.01, 0.003]} />
      <meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={1.0} toneMapped={false} />
    </mesh>

    {/* Rotary dial right */}
    <mesh position={[0.13, -0.06, 0.132]}>
      <cylinderGeometry args={[0.026, 0.026, 0.012, 14]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#262b35" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0.13, -0.06, 0.139]}>
      <cylinderGeometry args={[0.018, 0.018, 0.003, 14]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <mesh position={[0.13, -0.044, 0.14]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.002, 0.01, 0.003]} />
      <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.0} toneMapped={false} />
    </mesh>

    {/* Guarded toggle center front */}
    <mesh position={[0, -0.06, 0.132]}>
      <boxGeometry args={[0.034, 0.034, 0.006]} />
      <meshStandardMaterial color="#1a1e26" roughness={0.85} />
    </mesh>
    {/* Guard cover */}
    <mesh position={[0, -0.042, 0.135]} rotation={[-0.3, 0, 0]}>
      <boxGeometry args={[0.03, 0.005, 0.022]} />
      <meshStandardMaterial color="#262b35" roughness={0.7} />
    </mesh>
    {/* Toggle under guard */}
    <mesh position={[0, -0.056, 0.136]}>
      <cylinderGeometry args={[0.004, 0.004, 0.018, 6]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#3a4150" metalness={0.6} roughness={0.35} />
    </mesh>
    {/* Red indicator */}
    <mesh position={[0, -0.07, 0.136]}>
      <sphereGeometry args={[0.004, 6, 6]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>

    {/* Row of small push-button indicators lower front */}
    {[-0.1, -0.05, 0, 0.05, 0.1].map((x, i) => (
      <group key={i} position={[x, -0.18, 0.132]}>
        <mesh>
          <boxGeometry args={[0.026, 0.018, 0.006]} />
          <meshStandardMaterial color="#0c0e13" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <boxGeometry args={[0.018, 0.01, 0.004]} />
          <meshStandardMaterial
            color={["#27e0ff","#33ff99","#f4a300","#ff4d4d","#dff1ff"][i]}
            emissive={["#27e0ff","#33ff99","#f4a300","#ff4d4d","#dff1ff"][i]}
            emissiveIntensity={1.3}
            toneMapped={false}
          />
        </mesh>
      </group>
    ))}
  </group>

  {/* ── RUDDER PEDALS ── */}

  {/* LEFT rudder pedal group at (-0.22, -0.85, 1.45) */}
  <group position={[-0.22, -0.85, 1.45]}>
    {/* Pivot arm cylinder — goes up-back to floor */}
    <mesh position={[0, 0.06, -0.06]} rotation={[0.55, 0, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
      <meshStandardMaterial color="#3a4150" metalness={0.6} roughness={0.4} />
    </mesh>
    {/* Foot plate angled */}
    <mesh position={[0, 0.0, 0.0]} rotation={[-0.18, 0, 0]}>
      <boxGeometry args={[0.13, 0.014, 0.11]} />
      <meshStandardMaterial color="#262b35" metalness={0.55} roughness={0.45} />
    </mesh>
    {/* Rubber tread strips */}
    {[-0.038, 0, 0.038].map((x, i) => (
      <mesh key={i} position={[x, 0.009, 0.0]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.018, 0.006, 0.092]} />
        <meshStandardMaterial color="#15171c" roughness={0.95} />
      </mesh>
    ))}
    {/* Pedal heel stop */}
    <mesh position={[0, 0.01, -0.052]} rotation={[-0.18, 0, 0]}>
      <boxGeometry args={[0.12, 0.018, 0.012]} />
      <meshStandardMaterial color="#3a4150" metalness={0.5} roughness={0.5} />
    </mesh>
    {/* Pivot axle knob left */}
    <mesh position={[-0.068, 0.04, -0.05]}>
      <cylinderGeometry args={[0.009, 0.009, 0.018, 8]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#3a4150" metalness={0.65} roughness={0.35} />
    </mesh>
    {/* Lower floor attachment bracket */}
    <mesh position={[0, -0.06, -0.09]}>
      <boxGeometry args={[0.08, 0.014, 0.02]} />
      <meshStandardMaterial color="#262b35" metalness={0.5} roughness={0.5} />
    </mesh>
  </group>

  {/* RIGHT rudder pedal group at (0.22, -0.85, 1.45) */}
  <group position={[0.22, -0.85, 1.45]}>
    <mesh position={[0, 0.06, -0.06]} rotation={[0.55, 0, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
      <meshStandardMaterial color="#3a4150" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.0, 0.0]} rotation={[-0.18, 0, 0]}>
      <boxGeometry args={[0.13, 0.014, 0.11]} />
      <meshStandardMaterial color="#262b35" metalness={0.55} roughness={0.45} />
    </mesh>
    {[-0.038, 0, 0.038].map((x, i) => (
      <mesh key={i} position={[x, 0.009, 0.0]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.018, 0.006, 0.092]} />
        <meshStandardMaterial color="#15171c" roughness={0.95} />
      </mesh>
    ))}
    <mesh position={[0, 0.01, -0.052]} rotation={[-0.18, 0, 0]}>
      <boxGeometry args={[0.12, 0.018, 0.012]} />
      <meshStandardMaterial color="#3a4150" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0.068, 0.04, -0.05]}>
      <cylinderGeometry args={[0.009, 0.009, 0.018, 8]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#3a4150" metalness={0.65} roughness={0.35} />
    </mesh>
    <mesh position={[0, -0.06, -0.09]}>
      <boxGeometry args={[0.08, 0.014, 0.02]} />
      <meshStandardMaterial color="#262b35" metalness={0.5} roughness={0.5} />
    </mesh>
  </group>

  {/* Rudder pedal cross-bar / floor rail */}
  <mesh position={[0, -0.88, 1.38]}>
    <boxGeometry args={[0.52, 0.016, 0.025]} />
    <meshStandardMaterial color="#3a4150" metalness={0.55} roughness={0.4} />
  </mesh>

  {/* Floor panel under pedals */}
  <mesh position={[0, -0.92, 1.35]}>
    <boxGeometry args={[0.54, 0.01, 0.28]} />
    <meshStandardMaterial color="#12161d" roughness={0.9} />
  </mesh>
</group>

            {/* ====== detailed panel: glareshield ====== */}
            <group position={[0, 0.54, 1.52]}>

  {/* === ANALOG GAUGE 1 - LEFT (e.g. AOA) === */}
  <group position={[-0.62, 0, 0]} rotation={[-0.5, 0, 0]}>
    {/* bezel ring */}
    <mesh>
      <torusGeometry args={[0.072, 0.010, 10, 32]} />
      <meshStandardMaterial color="#3a4150" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* dial face */}
    <mesh position={[0, 0, -0.005]}>
      <cylinderGeometry args={[0.066, 0.066, 0.008, 32]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    {/* outer ring dark */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.072, 0.072, 0.014, 32]} />
      <meshStandardMaterial color="#12161d" roughness={0.7} />
    </mesh>
    {/* needle */}
    <mesh position={[0.018, 0.002, 0.006]} rotation={[0, 0, -0.6]}>
      <boxGeometry args={[0.052, 0.005, 0.003]} />
      <meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={0.8} toneMapped={false} />
    </mesh>
    {/* tick marks */}
    <mesh position={[0, 0.062, 0.007]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[-0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.044, 0.044, 0.007]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.004, 0.009, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[-0.044, 0.044, 0.007]} rotation={[0, 0, -Math.PI / 4]}>
      <boxGeometry args={[0.004, 0.009, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <Text position={[0, -0.046, 0.01]} fontSize={0.018} color="#8fb3c7" anchorX="center" anchorY="middle">AOA</Text>
    {/* center hub */}
    <mesh position={[0, 0, 0.009]}>
      <cylinderGeometry args={[0.007, 0.007, 0.005, 12]} />
      <meshStandardMaterial color="#262b35" metalness={0.9} />
    </mesh>
  </group>

  {/* === ANALOG GAUGE 2 - CENTER-LEFT (e.g. VSI) === */}
  <group position={[-0.21, 0, 0]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <torusGeometry args={[0.072, 0.010, 10, 32]} />
      <meshStandardMaterial color="#3a4150" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, -0.005]}>
      <cylinderGeometry args={[0.066, 0.066, 0.008, 32]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.072, 0.072, 0.014, 32]} />
      <meshStandardMaterial color="#12161d" roughness={0.7} />
    </mesh>
    {/* needle pointing up-right */}
    <mesh position={[0.016, 0.016, 0.006]} rotation={[0, 0, -Math.PI / 4]}>
      <boxGeometry args={[0.055, 0.005, 0.003]} />
      <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={0.9} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.062, 0.007]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0, -0.062, 0.007]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[-0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <Text position={[0, -0.046, 0.01]} fontSize={0.018} color="#8fb3c7" anchorX="center" anchorY="middle">VSI</Text>
    <mesh position={[0, 0, 0.009]}>
      <cylinderGeometry args={[0.007, 0.007, 0.005, 12]} />
      <meshStandardMaterial color="#262b35" metalness={0.9} />
    </mesh>
  </group>

  {/* === ANALOG GAUGE 3 - CENTER-RIGHT (e.g. OIL) === */}
  <group position={[0.21, 0, 0]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <torusGeometry args={[0.072, 0.010, 10, 32]} />
      <meshStandardMaterial color="#3a4150" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, -0.005]}>
      <cylinderGeometry args={[0.066, 0.066, 0.008, 32]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.072, 0.072, 0.014, 32]} />
      <meshStandardMaterial color="#12161d" roughness={0.7} />
    </mesh>
    {/* needle mid-range */}
    <mesh position={[0.008, 0.028, 0.006]} rotation={[0, 0, -0.3]}>
      <boxGeometry args={[0.054, 0.005, 0.003]} />
      <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={0.9} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.062, 0.007]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[-0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.044, -0.044, 0.007]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.004, 0.009, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <Text position={[0, -0.046, 0.01]} fontSize={0.018} color="#8fb3c7" anchorX="center" anchorY="middle">OIL</Text>
    <mesh position={[0, 0, 0.009]}>
      <cylinderGeometry args={[0.007, 0.007, 0.005, 12]} />
      <meshStandardMaterial color="#262b35" metalness={0.9} />
    </mesh>
  </group>

  {/* === ANALOG GAUGE 4 - RIGHT (e.g. TEMP) === */}
  <group position={[0.62, 0, 0]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <torusGeometry args={[0.072, 0.010, 10, 32]} />
      <meshStandardMaterial color="#3a4150" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, -0.005]}>
      <cylinderGeometry args={[0.066, 0.066, 0.008, 32]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.072, 0.072, 0.014, 32]} />
      <meshStandardMaterial color="#12161d" roughness={0.7} />
    </mesh>
    {/* needle high reading */}
    <mesh position={[0.028, -0.010, 0.006]} rotation={[0, 0, 1.1]}>
      <boxGeometry args={[0.053, 0.005, 0.003]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.0} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.062, 0.007]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[-0.062, 0, 0.007]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <mesh position={[0, -0.062, 0.007]}>
      <boxGeometry args={[0.004, 0.012, 0.002]} />
      <meshStandardMaterial color="#8fb3c7" />
    </mesh>
    <Text position={[0, -0.046, 0.01]} fontSize={0.018} color="#8fb3c7" anchorX="center" anchorY="middle">TEMP</Text>
    <mesh position={[0, 0, 0.009]}>
      <cylinderGeometry args={[0.007, 0.007, 0.005, 12]} />
      <meshStandardMaterial color="#262b35" metalness={0.9} />
    </mesh>
  </group>

  {/* === CAUTION/WARNING ANNUNCIATOR CLUSTER (3x2 grid) === */}
  {/* Mounted center-panel, tilted toward pilot */}
  <group position={[0, -0.055, 0.04]} rotation={[-0.5, 0, 0]}>

    {/* backing plate */}
    <mesh position={[0, 0, -0.006]}>
      <boxGeometry args={[0.29, 0.115, 0.008]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>

    {/* Row 0, Col 0 — ENG — lit amber */}
    <mesh position={[-0.088, 0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#04121a" emissive="#f4a300" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    <Text position={[-0.088, 0.030, 0.005]} fontSize={0.016} color="#f4a300" anchorX="center" anchorY="middle" rotation={[0, 0, 0]}>ENG</Text>

    {/* Row 0, Col 1 — HYD — dim */}
    <mesh position={[0, 0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <Text position={[0, 0.030, 0.005]} fontSize={0.016} color="#3a4150" anchorX="center" anchorY="middle">HYD</Text>

    {/* Row 0, Col 2 — FUEL — lit red */}
    <mesh position={[0.088, 0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#04121a" emissive="#ff4d4d" emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    <Text position={[0.088, 0.030, 0.005]} fontSize={0.016} color="#ff4d4d" anchorX="center" anchorY="middle">FUEL</Text>

    {/* Row 1, Col 0 — GEAR — dim */}
    <mesh position={[-0.088, -0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <Text position={[-0.088, -0.030, 0.005]} fontSize={0.016} color="#3a4150" anchorX="center" anchorY="middle">GEAR</Text>

    {/* Row 1, Col 1 — ELEC — dim */}
    <mesh position={[0, -0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <Text position={[0, -0.030, 0.005]} fontSize={0.016} color="#3a4150" anchorX="center" anchorY="middle">ELEC</Text>

    {/* Row 1, Col 2 — OXY — dim */}
    <mesh position={[0.088, -0.030, 0]}>
      <boxGeometry args={[0.072, 0.040, 0.006]} />
      <meshStandardMaterial color="#0c0e13" roughness={0.9} />
    </mesh>
    <Text position={[0.088, -0.030, 0.005]} fontSize={0.016} color="#3a4150" anchorX="center" anchorY="middle">OXY</Text>

    {/* border dividers */}
    <mesh position={[0.046, 0, 0.002]}>
      <boxGeometry args={[0.003, 0.115, 0.003]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    <mesh position={[-0.046, 0, 0.002]}>
      <boxGeometry args={[0.003, 0.115, 0.003]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    <mesh position={[0, 0, 0.002]}>
      <boxGeometry args={[0.29, 0.003, 0.003]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>

  </group>

  {/* === GLARESHIELD STRIP BASE === */}
  <mesh position={[0, -0.075, 0.02]} rotation={[-0.5, 0, 0]}>
    <boxGeometry args={[1.78, 0.02, 0.19]} />
    <meshStandardMaterial color="#12161d" roughness={0.85} />
  </mesh>

  {/* small rocker switches left strip */}
  <group position={[-0.80, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>
  <group position={[-0.74, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>
  <group position={[-0.68, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>

  {/* small rocker switches right strip */}
  <group position={[0.80, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>
  <group position={[0.74, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>
  <group position={[0.68, -0.055, 0.03]} rotation={[-0.5, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.022, 0.035, 0.008]} />
      <meshStandardMaterial color="#262b35" roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.010, 0.007]}>
      <boxGeometry args={[0.016, 0.014, 0.006]} />
      <meshStandardMaterial color="#3a4150" roughness={0.5} />
    </mesh>
  </group>

  {/* small indicator LEDs row above annunciator */}
  <group position={[-0.35, 0.04, 0.04]} rotation={[-0.5, 0, 0]}>
    <mesh><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#04121a" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} /></mesh>
  </group>
  <group position={[-0.28, 0.04, 0.04]} rotation={[-0.5, 0, 0]}>
    <mesh><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#04121a" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} /></mesh>
  </group>
  <group position={[0.28, 0.04, 0.04]} rotation={[-0.5, 0, 0]}>
    <mesh><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#04121a" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} /></mesh>
  </group>
  <group position={[0.35, 0.04, 0.04]} rotation={[-0.5, 0, 0]}>
    <mesh><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#12161d" roughness={0.9} /></mesh>
  </group>

</group>

            {/* ====== detailed panel: overhead ====== */}
            <group position={[0, 1.45, 0.175]}>
  <mesh rotation={[0.4, 0, 0]} position={[0, 0, 0]}>
    <boxGeometry args={[1.1, 0.04, 0.9]} />
    <meshStandardMaterial color="#12161d" />
  </mesh>
  <mesh rotation={[0.4, 0, 0]} position={[0, -0.022, 0]}>
    <boxGeometry args={[1.14, 0.01, 0.94]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  <Text position={[-0.34, -0.042, -0.22]} rotation={[0.4 + Math.PI / 2, 0, 0]} fontSize={0.04} color="#8fb3c7" anchorX="center" anchorY="middle">FUEL</Text>
  <Text position={[0.0, -0.042, -0.22]} rotation={[0.4 + Math.PI / 2, 0, 0]} fontSize={0.04} color="#8fb3c7" anchorX="center" anchorY="middle">ELEC</Text>
  <Text position={[0.34, -0.042, -0.22]} rotation={[0.4 + Math.PI / 2, 0, 0]} fontSize={0.04} color="#8fb3c7" anchorX="center" anchorY="middle">LIGHTS</Text>
  <mesh rotation={[0.4, 0, 0]} position={[-0.18, -0.025, 0]}>
    <boxGeometry args={[0.008, 0.012, 0.82]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  <mesh rotation={[0.4, 0, 0]} position={[0.18, -0.025, 0]}>
    <boxGeometry args={[0.008, 0.012, 0.82]} />
    <meshStandardMaterial color="#3a4150" />
  </mesh>
  {[-0.38, -0.32, -0.26].map((x, i) => (
    <group key={`fuel-r1-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, -0.1]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  {[-0.38, -0.32, -0.26].map((x, i) => (
    <group key={`fuel-r2-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, 0.12]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  {[-0.06, 0.0, 0.06].map((x, i) => (
    <group key={`elec-r1-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, -0.1]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  {[-0.06, 0.0, 0.06].map((x, i) => (
    <group key={`elec-r2-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, 0.12]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  {[0.26, 0.32, 0.38].map((x, i) => (
    <group key={`lights-r1-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, -0.1]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  {[0.26, 0.32, 0.38].map((x, i) => (
    <group key={`lights-r2-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.03, 0.12]}>
      <mesh><boxGeometry args={[0.038, 0.016, 0.05]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.008, -0.018]}><boxGeometry args={[0.034, 0.012, 0.03]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.004, 0.004, 0.022, 6]} /><meshStandardMaterial color="#262b35" /></mesh>
      <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#15171c" /></mesh>
    </group>
  ))}
  <mesh rotation={[0.4, 0, 0]} position={[-0.32, -0.028, 0.28]}>
    <cylinderGeometry args={[0.009, 0.009, 0.008, 8]} />
    <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh rotation={[0.4, 0, 0]} position={[0.0, -0.028, 0.28]}>
    <cylinderGeometry args={[0.009, 0.009, 0.008, 8]} />
    <meshStandardMaterial color="#f4a300" emissive="#f4a300" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh rotation={[0.4, 0, 0]} position={[0.32, -0.028, 0.28]}>
    <cylinderGeometry args={[0.009, 0.009, 0.008, 8]} />
    <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  <mesh rotation={[0.4, 0, 0]} position={[0.16, -0.028, 0.28]}>
    <cylinderGeometry args={[0.009, 0.009, 0.008, 8]} />
    <meshStandardMaterial color="#27e0ff" emissive="#27e0ff" emissiveIntensity={1.2} toneMapped={false} />
  </mesh>
  {[-0.32, 0.0, 0.16, 0.32].map((x, i) => (
    <mesh key={`led-bezel-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.032, 0.28]}>
      <cylinderGeometry args={[0.012, 0.012, 0.006, 8]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
  ))}
  <group rotation={[0.4, 0, 0]} position={[-0.32, -0.025, 0.0]}>
    <mesh><cylinderGeometry args={[0.022, 0.022, 0.01, 12]} /><meshStandardMaterial color="#3a4150" /></mesh>
    <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.015, 0.015, 0.016, 12]} /><meshStandardMaterial color="#262b35" /></mesh>
    <mesh position={[0, 0.018, -0.012]}><boxGeometry args={[0.003, 0.003, 0.01]} /><meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={0.8} toneMapped={false} /></mesh>
  </group>
  <group rotation={[0.4, 0, 0]} position={[0.0, -0.025, 0.0]}>
    <mesh><cylinderGeometry args={[0.022, 0.022, 0.01, 12]} /><meshStandardMaterial color="#3a4150" /></mesh>
    <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.015, 0.015, 0.016, 12]} /><meshStandardMaterial color="#262b35" /></mesh>
    <mesh position={[0, 0.018, -0.012]}><boxGeometry args={[0.003, 0.003, 0.01]} /><meshStandardMaterial color="#dff1ff" emissive="#dff1ff" emissiveIntensity={0.8} toneMapped={false} /></mesh>
  </group>
  <group position={[0, -0.01, 0.38]}>
    <mesh rotation={[0.4, 0, 0]} position={[0, 0, 0]}>
      <boxGeometry args={[0.07, 0.04, 0.05]} />
      <meshStandardMaterial color="#262b35" />
    </mesh>
    <mesh rotation={[0.4 + 0.3, 0, 0]} position={[0, -0.04, 0.03]}>
      <boxGeometry args={[0.025, 0.09, 0.022]} />
      <meshStandardMaterial color="#3a4150" />
    </mesh>
    <mesh rotation={[0.4 + 0.3, 0, 0]} position={[0, -0.09, 0.06]}>
      <capsuleGeometry args={[0.018, 0.055, 6, 8]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={0.4} toneMapped={false} />
    </mesh>
    {[0, 0.02, 0.04].map((dz, i) => (
      <mesh key={`grip-ring-${i}`} rotation={[0.4 + 0.3, 0, 0]} position={[0, -0.09 + dz * 0.5, 0.06 + dz * 0.3]}>
        <torusGeometry args={[0.018, 0.003, 6, 12]} />
        <meshStandardMaterial color="#15171c" />
      </mesh>
    ))}
    <Text position={[0, -0.012, 0.012]} rotation={[0.4 + Math.PI / 2, 0, 0]} fontSize={0.028} color="#8fb3c7" anchorX="center" anchorY="middle">CNPY</Text>
    <mesh rotation={[0.4, 0, 0]} position={[0.04, -0.01, 0.0]}>
      <cylinderGeometry args={[0.007, 0.007, 0.006, 8]} />
      <meshStandardMaterial color="#33ff99" emissive="#33ff99" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  </group>
  {[-0.44, -0.44, 0.44, 0.44].map((x, i) => (
    <group key={`rocker-${i}`} rotation={[0.4, 0, 0]} position={[x, -0.028, i % 2 === 0 ? -0.06 : 0.18]}>
      <mesh><boxGeometry args={[0.03, 0.012, 0.042]} /><meshStandardMaterial color="#0c0e13" /></mesh>
      <mesh position={[0, 0.008, -0.009]}><boxGeometry args={[0.024, 0.01, 0.018]} /><meshStandardMaterial color="#3a4150" /></mesh>
      <mesh position={[0, 0.008, 0.009]}><boxGeometry args={[0.024, 0.007, 0.018]} /><meshStandardMaterial color="#262b35" /></mesh>
    </group>
  ))}
  {[-0.4, 0.0, 0.4].map((z, i) => (
    <mesh key={`rib-${i}`} position={[0, 0.042, z]}>
      <boxGeometry args={[1.1, 0.05, 0.012]} />
      <meshStandardMaterial color="#1a1f28" />
    </mesh>
  ))}
  <mesh position={[-0.54, 0.03, 0.1]}>
    <boxGeometry args={[0.02, 0.06, 0.88]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>
  <mesh position={[0.54, 0.03, 0.1]}>
    <boxGeometry args={[0.02, 0.06, 0.88]} />
    <meshStandardMaterial color="#262b35" />
  </mesh>
</group>

        </group>
    )
}

// Camera offsets per cockpit view (world space; the plane always travels +Z)
const VIEWS = {
    chase: new THREE.Vector3(0, 2.2, -7.6),
    top: new THREE.Vector3(0, 13, -3.2),
    left: new THREE.Vector3(-10.5, 3, -1.5),
    right: new THREE.Vector3(10.5, 3, -1.5),
    front: new THREE.Vector3(0, 1.8, 8.5),
}

const Airplane = forwardRef(({ joystickDataRef, verticalControlRef, isMobile, setSpeed, planeViewRef, planeColor = '#eef2f7', lowPowerMode = false, ...props }, ref) => {
    // Honour reduced-motion: kill the vestibular-trigger cockpit shake
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
    const noShake = lowPowerMode || reducedMotion
    const group = useRef()
    const jetWrapRef = useRef()
    const cockpitRef = useRef()
    const keysRef = useKeyboard()
    const { camera } = useThree()

    // Physics parameters — tuned slower so each world reads longer in flight
    const baseSpeed = 0.62
    const maxSpeed = 1.9 // Maximum speed multiplier
    const acceleration = 0.02 // Acceleration rate (gentler ramp)
    const currentSpeedRef = useRef(baseSpeed) // Track current speed
    const boostRef = useRef(0) // turbo factor → drives the blue exhaust (can exceed 1 in portals)
    const reverseRef = useRef(false) // true while backing up → nose reverse-thrust jets fire
    const cockpitTele = useRef({ roll: 0, pitch: 0, spd: 0, boost: 0, z: 0 }) // feeds the live cockpit instruments
    const cameraOffset = useRef(new THREE.Vector3(0, 2.2, -7.6))
    const targetCameraPos = useRef(new THREE.Vector3())

    // Reduced roll amount as requested (was PI/3)
    const maxRoll = Math.PI / 6 // 30 degrees
    const maxPitch = Math.PI / 6 // 30 degrees

    useFrame((state, delta) => {
        if (!group.current) return

        // Get input values
        let forward = 0
        let right = 0
        let up = 0

        const keys = keysRef.current

        // Keyboard controls
        if (keys.forward) forward += 1
        if (keys.backward) forward -= 1
        if (keys.right) right -= 1
        if (keys.left) right += 1
        if (keys.space) up += 1
        if (keys.shift) up -= 1

        // Joystick controls (if available)
        if (joystickDataRef && joystickDataRef.current) {
            const { x, y } = joystickDataRef.current
            // Map joystick X to right, Y to forward with boost
            right -= x * 3
            forward += y * 3
        }

        // Vertical Control Buttons (Mobile)
        if (verticalControlRef && verticalControlRef.current) {
            up += verticalControlRef.current
        }

        // Acceleration Logic
        if (forward > 0) {
            currentSpeedRef.current = Math.min(currentSpeedRef.current + acceleration, maxSpeed)
        } else {
            currentSpeedRef.current = Math.max(currentSpeedRef.current - acceleration, baseSpeed)
        }

        // Apply movement speed
        const moveSpeed = currentSpeedRef.current * (keys.shift ? 2 : 1) * 17 * delta

        // Update Position with Clamping (Boundaries)
        // Limits: X: +/- 30, Y: -10 to 30, Z: -6 (can't reverse out behind the start) to 700 (into deep space)
        group.current.position.x = THREE.MathUtils.clamp(group.current.position.x + right * moveSpeed, -30, 30)
        group.current.position.y = THREE.MathUtils.clamp(group.current.position.y + up * moveSpeed * 0.5, -10, 30)
        group.current.position.z = THREE.MathUtils.clamp(group.current.position.z + forward * moveSpeed, -6, 700)

        // ── Wormhole pull/push: near a portal boundary the tunnel grabs the plane,
        // funnels it to the centre (x,y → 0) and slings it forward through. ──
        const PORTALS = [110, 200, 330, 460]
        const PORTAL_INFL = 30
        let portalProx = 0
        for (let i = 0; i < PORTALS.length; i++) {
            const d = Math.abs(group.current.position.z - PORTALS[i])
            if (d < PORTAL_INFL) { portalProx = Math.max(portalProx, 1 - d / PORTAL_INFL) }
        }
        // Direction the pilot wants to go (so the wormhole flings you THAT way —
        // forward by default, but backward if you're actively reversing through).
        const reversing = forward < -0.1
        reverseRef.current = reversing
        if (portalProx > 0) {
            // suck through the tunnel in the travel direction (strongest at the centre)
            const suckDir = reversing ? -1 : 1
            const nz = group.current.position.z + portalProx * portalProx * 34 * delta * suckDir
            group.current.position.z = THREE.MathUtils.clamp(nz, -6, 700)
            // funnel toward the tunnel axis
            const pull = Math.min(1, portalProx * 4 * delta)
            group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, pull)
            group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 0, pull)
        }

        // Turbo factor for the blue exhaust: throttle (forward), reverse-thrust when
        // backing, and a big SURGE in portals (can exceed 1 so the flames blaze huge).
        const throttle = (currentSpeedRef.current - baseSpeed) / (maxSpeed - baseSpeed)
        const revThrust = reversing ? 0.7 : 0
        boostRef.current = Math.min(1.7, Math.max(throttle * (keys.shift ? 1.4 : 1), revThrust, portalProx * 1.5))

        // Rotation Logic
        const targetRoll = -right * maxRoll
        const targetPitch = up * maxPitch * 0.5

        // Update UI Speedometer (0 to 100 scale approximations)
        if (setSpeed) {
            // Mapping baseSpeed(0.5) -> ~0 km/h visual, maxSpeed(1.5) -> 100%
            // Actually let's just map it to a nice number
            // Speed is roughly 10-30 units/sec. Let's say 0-300 km/h
            const speedDisplay = Math.round((currentSpeedRef.current - 0.4) * 200 * (forward > 0 ? 1 : 0));
            setSpeed(speedDisplay < 0 ? 0 : speedDisplay)
        }

        // Smooth rotation
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRoll, delta * 5)
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetPitch, delta * 5)

        // Orient the plane to face +Z
        group.current.rotation.y = Math.PI

        // Feed the live cockpit instruments
        cockpitTele.current.roll = group.current.rotation.z
        cockpitTele.current.pitch = group.current.rotation.x
        cockpitTele.current.spd = (currentSpeedRef.current - baseSpeed) / (maxSpeed - baseSpeed)
        cockpitTele.current.boost = boostRef.current
        cockpitTele.current.z = group.current.position.z

        // Camera Follow — offset depends on the selected cockpit view (plane always faces +Z)
        const view = (planeViewRef && planeViewRef.current) || 'chase'
        const inCockpit = view === 'cockpit'
        if (cockpitRef.current) cockpitRef.current.visible = inCockpit
        if (jetWrapRef.current) jetWrapRef.current.visible = !inCockpit

        const p = group.current.position
        if (inCockpit) {
            // Rigidly lock the camera to the pilot seat — a lerp lags behind at speed
            // (and during the wormhole suck) and you slip out the back of the cockpit.
            const b = boostRef.current
            const shake = noShake ? 0 : b
            const sx = (Math.sin(state.clock.elapsedTime * 47) * 0.006 + Math.sin(state.clock.elapsedTime * 31) * 0.004) * shake
            const sy = (Math.cos(state.clock.elapsedTime * 53) * 0.006) * shake
            camera.position.set(p.x + sx, p.y + 1.05 + sy, p.z + 0.42)
            camera.lookAt(p.x, p.y + 1.2, p.z + 24)
        } else {
            const desired = VIEWS[view] || VIEWS.chase
            cameraOffset.current.lerp(desired, Math.min(1, delta * 3.5)) // smooth view transitions
            targetCameraPos.current.copy(p).add(cameraOffset.current)
            camera.position.lerp(targetCameraPos.current, Math.min(1, delta * 6))
            camera.lookAt(p.x, p.y + 0.5, p.z)
        }
    })

    useImperativeHandle(ref, () => group.current)

    return (
        <group ref={group} {...props} dispose={null}>
            {/* smaller + camera pulled back so the jet sits deeper in frame, not on top of the lens */}
            <group ref={jetWrapRef} scale={0.3}>
                <Jet boostRef={boostRef} reverseRef={reverseRef} planeColor={planeColor} />
            </group>
            {/* First-person cockpit interior — counter-rotates the parent's Y-flip and
                undoes the parent scale so it renders world-aligned at world units. */}
            <group ref={cockpitRef} visible={false} rotation={[0, Math.PI, 0]} scale={1 / 7.5}>
                <Cockpit planeColor={planeColor} telemetry={cockpitTele} viewRef={planeViewRef} />
            </group>
        </group>
    )
})

export default Airplane;
