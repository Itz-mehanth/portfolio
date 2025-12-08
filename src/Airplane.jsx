import React, { useRef } from 'react'
import { useGLTF, useScroll, Outlines } from '@react-three/drei'
import { forwardRef, useImperativeHandle, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import useKeyboard from './utils/useKeyboard'

const Airplane = forwardRef(({ joystickDataRef, verticalControlRef, isMobile, ...props }, ref) => {
    const group = useRef()
    const { scene } = useGLTF('/models/paper_airplane.glb')
    const keys = useKeyboard()
    const { camera } = useThree()

    // Physics parameters
    const speed = 0.5
    // Reduced roll amount as requested (was PI/3)
    const maxRoll = Math.PI / 6 // 30 degrees
    const maxPitch = Math.PI / 6 // 30 degrees

    useFrame((state, delta) => {
        if (!group.current) return

        // Get input values
        let forward = 0
        let right = 0
        let up = 0

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

        // Apply movement speed
        const moveSpeed = speed * (keys.shift ? 2 : 1) * 20 * delta

        // Update Position with Clamping (Boundaries)
        // Limits: X: +/- 30, Y: -10 to 30, Z: -20 to 250
        group.current.position.x = THREE.MathUtils.clamp(group.current.position.x + right * moveSpeed, -30, 30)
        group.current.position.y = THREE.MathUtils.clamp(group.current.position.y + up * moveSpeed * 0.5, -10, 30)
        group.current.position.z = THREE.MathUtils.clamp(group.current.position.z + forward * moveSpeed, -20, 250)

        // Rotation Logic
        const targetRoll = -right * maxRoll
        const targetPitch = up * maxPitch * 0.5

        // Smooth rotation
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRoll, delta * 5)
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetPitch, delta * 5)

        // Orient the plane to face +Z
        group.current.rotation.y = Math.PI

        // Camera Follow
        // Place camera behind (-Z relative to plane) and above
        // Reduced offset for closer view
        const cameraOffset = new THREE.Vector3(0, 1.5, -5)
        const targetCameraPos = group.current.position.clone().add(cameraOffset)

        // Smoothly move camera
        camera.position.lerp(targetCameraPos, delta * 5)
        camera.lookAt(group.current.position)
    })

    useImperativeHandle(ref, () => ({
        // empty
    }))


    // Apply Toon Shader to Airplane
    // We don't need useLayoutEffect for material swapping anymore since we are defining meshes explicitly below
    // But we need the nodes and materials
    const { nodes, materials } = useGLTF('/models/paper_airplane.glb')

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Offset to center visuals */}
            <group position={[0.9, 0, 0]}>
                <group position={[-0.794, 0, 0]}>
                    {[
                        nodes.Object_4, nodes.Object_4001, nodes.Object_4002, nodes.Object_4003,
                        nodes.Object_4004, nodes.Object_4005, nodes.Object_4006, nodes.Object_4007,
                        nodes.Object_4008, nodes.Object_4009, nodes.Object_4010
                    ].map((node, i) => (
                        <mesh
                            key={i}
                            castShadow
                            receiveShadow
                            geometry={node.geometry}
                        >
                            <meshToonMaterial color="white" />{/* Override with Toon */}
                            <Outlines thickness={0.9} color="black" />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    )
})

export default Airplane;

useGLTF.preload('/models/paper_airplane.glb')

useGLTF.preload('/models/paper_airplane.glb')
