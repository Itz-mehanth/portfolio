import { useGLTF, useFBX, useAnimations, useScroll } from '@react-three/drei'
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const  Avatar = forwardRef((props, ref) => {
  const scrollEnabled  = props.scrollEnabled
  const setStartShockwave = props.setStartShockwave
  const setTeleported = props.setTeleported
  const animationDisabled = props.static || false
  const setIsCanvasScrollLocked = props.setIsCanvasScrollLocked

  const group = useRef()
  const eyeRef = useRef()
  const scroll = useScroll()
  const shockwaveTriggered = useRef(false)

  const { nodes, materials } = useGLTF('/models/character.glb')

  const { animations: standupAnim } = useFBX('/animations/Crouch To Stand.fbx')
  const { animations: walkAnim } = useFBX('/animations/Start Walking.fbx')
  const { animations: runAnim } = useFBX('/animations/Fast Run.fbx')
  const { animations: idleAnim } = useFBX('/animations/Breathing Idle.fbx')
  const { animations: closingAnim } = useFBX('/animations/Closing.fbx')
  const { animations: stretchAnim } = useFBX('/animations/Arm Stretching.fbx')
  const { animations: smashAnim } = useFBX('/animations/jump high.fbx')
  const { animations: landingAnim } = useFBX('/animations/Landing.fbx')
  const { animations: diveAnim } = useFBX('/animations/Run To Dive.fbx')
  const { animations: flyingAnim } = useFBX('/animations/Flying.fbx')
  const { animations: sittingAnim } = useFBX('/animations/Male Sitting Pose.fbx')

  // Rename animations for easy access
  standupAnim[0].name = 'StandUp'
  walkAnim[0].name = 'Walk'
  runAnim[0].name = 'Run'
  idleAnim[0].name = 'Idle'
  closingAnim[0].name = 'Closing'
  stretchAnim[0].name = 'Stretch'
  smashAnim[0].name = 'Smash'
  landingAnim[0].name = 'Landing'
  diveAnim[0].name = 'Dive'
  flyingAnim[0].name = 'Flying'
  sittingAnim[0].name = 'Sitting'

  const { actions } = useAnimations(
    [...closingAnim, ...standupAnim, ...sittingAnim, ...diveAnim, ...flyingAnim, ...landingAnim, ...walkAnim, ...runAnim, ...idleAnim, ...stretchAnim, ...smashAnim],
    group
  )

  const activeAction = useRef(null)

  const playAnimation = (name) => {
    if (!actions[name]) return

    const nextAction = actions[name]

    if (activeAction.current && activeAction.current !== nextAction) {
      activeAction.current.crossFadeTo(nextAction, 0.3, true)
    }

    nextAction
      .reset()
      .fadeIn(0.3)
      .play()

    activeAction.current = nextAction
  }

  // Scrub animation helper
  const scrubAnimation = (name, normalizedProgress) => {
    Object.entries(actions).forEach(([key, action]) => {
      if (key !== name) {
        action.stop()
        action.weight = 0
      }
    })

    const action = actions[name]
    if (!action) return
    const duration = action.getClip().duration
    action.reset()
    action.paused = true
    action.time = normalizedProgress * duration
    if (name == "Run"){
      group.current.position.z = normalizedProgress * 15
    }
    action.enabled = true
    action.weight = 1
    action.play()
  }

  function generateUturnWaypoints({
    center = [0, 1.6, 0],   // eye or head position
    radius = 6,
    height = 2,
    segments = 30           // smoother path
  }) {
    const waypoints = []
    for (let i = 0; i < segments; i++) {
      const angle = Math.PI * (i / (segments - 1)) // From 0 to 180 degrees
      const x = center[0] + radius * Math.cos(angle)
      const z = center[2] + radius * Math.sin(angle)
      waypoints.push([x, center[1] + height, z])
    }
    return waypoints
  }

  function generateOrbitWaypoints({
    center = [0, 1.6, 0],
    radius = 5,
    height = 2,
    segments = 10
  }) {
    const waypoints = []
    for (let i = 0; i < segments; i++) {
      const angle = (i / (segments - 1)) * Math.PI * 2
      const x = center[0] + radius * Math.cos(angle)
      const z = center[2] + radius * Math.sin(angle)
      waypoints.push([x, center[1] + height, z])
    }
    return waypoints
  }


  // Pause and prepare animations for scrubbing
  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action.paused = true
      action.enabled = true
      action.setLoop(THREE.LoopOnce, 0)
      action.clampWhenFinished = true
      action.time = 0
      action.reset() // prevent leftover blend weights
    })
  }, [actions])

  // Scroll-controlled animation sequence
  useFrame(({camera}) => {
    if (!scrollEnabled) return
    if(animationDisabled){
      scrubAnimation('Sitting', 0)
      return
    }
    group.current.position.y = 0

    // console.log(scroll.offset.toFixed(4))

    const eyePosition = new THREE.Vector3()
    if (eyeRef.current) {
      eyeRef.current.getWorldPosition(eyePosition)
    }

    const progress = scroll.offset // 0 to 1
    const delta = scroll.delta // scroll speed
    
    // Original logic - keep the previous Z movement
    const wobbleAmplitude = 5; // how far it moves left and right
    const wobbleFrequency = 10; // how fast it wobbles (higher = faster)
    const zOffset = (progress) * 500;
    const wobbleX = Math.sin(progress * Math.PI * wobbleFrequency) * wobbleAmplitude;

    // Add forward movement based on progress and speed
    const forwardDistance = progress * 45; // Move forward 15 units max
    const speedMultiplier = Math.min(delta * 8, 1.5); // Speed affects movement (max 1.5x)
    const finalForwardDistance = forwardDistance * (1 + speedMultiplier * 0.2);

    // Combine original Z movement with forward movement
    group.current.position.z = zOffset - finalForwardDistance; // Original Z + forward movement
    camera.position.set(wobbleX, 5, -10 + zOffset - finalForwardDistance);
    camera.lookAt(group.current.position);

    // Adjust animation speed based on scroll speed
    const animationSpeed = 1 + (speedMultiplier * 0.3);
    actions['Flying'].play();
    actions['Flying'].setEffectiveWeight(1);
    actions['Flying'].setEffectiveTimeScale(animationSpeed);
  })

  // Ref methods exposed to parent
  useImperativeHandle(ref, () => ({
    async playSequence(sequence = []) {
      for (const name of sequence) {
        playAnimation(name)
        const duration = actions[name]?._clip?.duration ?? 0.8
        await new Promise((res) => setTimeout(res, duration * 800))
      }
    },
  }))
  
  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        ref={eyeRef}
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  )
})

function animateCameraAlongPath({
  camera,
  waypoints,
  progress,
  lookAtTarget = new THREE.Vector3(0, 0, 0),
}) {
  if (waypoints.length < 2) {
    console.warn('Need at least 2 waypoints for camera path.')
    return
  }

  // Create a smooth 3D curve
  const curve = new THREE.CatmullRomCurve3(
    waypoints.map(p => new THREE.Vector3(...p)),
    false, // not closed
    'catmullrom',
    0.5     // tension
  )

  const position = curve.getPoint(progress)
  camera.position.copy(position)

  camera.lookAt(lookAtTarget)
}

export default Avatar;

useGLTF.preload('/models/character.glb')
