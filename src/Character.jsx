// import { useGLTF, useFBX, useAnimations, useScroll, useProgress } from '@react-three/drei'
// import { useEffect, useRef, forwardRef, useImperativeHandle, Suspense, useState} from 'react'
// import * as THREE from 'three'
// import { useFrame, useThree } from '@react-three/fiber'
// // import { useAudio } from './context/AudioProvider'
// import { Billboard, Html, Outlines, Wireframe, Text } from '@react-three/drei'
// import { useCallback } from 'react'
// // Preload character model
// useGLTF.preload('/models/character.glb')


// function LoadingFallback() {
//   return (
//     <Billboard>
//       <Text fontSize={0.2} color="#000000">
//         Loading character...
//       </Text>
//     </Billboard>
//   );
// }

// // Separate component for animations to allow for independent loading
// function AnimationLoader({ onLoad, ...props }) {
//   const { animations: sittingAnim } = useFBX('/animations/Male Sitting Pose.fbx')
//   const { animations: runningAnim } = useFBX('/animations/Fast Run.fbx')

//   useEffect(() => {
//     if (onLoad) {
//       onLoad({ sittingAnim, runningAnim });
//     }
//   }, [sittingAnim, runningAnim, onLoad]);

//   return null;
// }

// const Character = forwardRef((props, ref) => {
//   const group = useRef();
//   const [animations, setAnimations] = useState(null);
//   const [activeAction, setActiveAction] = useState(null);

//   const { nodes, materials } = useGLTF('/models/character.glb');

//   const { actions } = useAnimations(
//     animations ? [...animations.sittingAnim, ...animations.runningAnim] : [],
//     group
//   );

//   // Function to smoothly play an animation
//   const playAnimation = useCallback((name) => {
//     if (!actions[name]) {
//       console.warn(`Animation "${name}" not found.`);
//       return;
//     }

//     const nextAction = actions[name];

//     // Fade from the current animation to the next one
//     if (activeAction && activeAction !== nextAction) {
//       activeAction.fadeOut(0.3);
//     }

//     // Reset, fade in, and play the new animation
//     nextAction
//       .reset()
//       .setLoop(THREE.LoopRepeat) // Use LoopRepeat to keep it playing
//       .fadeIn(0.3)
//       .play();

//     setActiveAction(nextAction);
//     console.log(`Playing animation: ${name}`);

//   }, [actions, activeAction]);


//   // When animations are loaded, play a default animation
//   useEffect(() => {
//     if (actions && actions.Running) {
//         // You can choose which animation to play by default
//         playAnimation('Running');
//         // playAnimation('Sitting');
//     }
//   }, [actions, playAnimation]);
  
//   return (
//     <group ref={group} {...props} dispose={null}>
//       <Suspense fallback={<LoadingFallback />}>
//         <primitive object={nodes.Hips} />
//         <skinnedMesh
//           name="EyeLeft"
//           geometry={nodes.EyeLeft.geometry}
//           material={materials.Wolf3D_Eye}
//           skeleton={nodes.EyeLeft.skeleton}
//           morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
//           morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
//         />
//         <skinnedMesh
//           name="EyeRight"
//           geometry={nodes.EyeRight.geometry}
//           material={materials.Wolf3D_Eye}
//           skeleton={nodes.EyeRight.skeleton}
//           morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
//           morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
//         />
//         <skinnedMesh
//           name="Wolf3D_Head"
//           geometry={nodes.Wolf3D_Head.geometry}
//           material={materials.Wolf3D_Skin}
//           skeleton={nodes.Wolf3D_Head.skeleton}
//           morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
//           morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
//         />
//         <skinnedMesh
//           name="Wolf3D_Teeth"
//           geometry={nodes.Wolf3D_Teeth.geometry}
//           material={materials.Wolf3D_Teeth}
//           skeleton={nodes.Wolf3D_Teeth.skeleton}
//           morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
//           morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
//         />
//         <skinnedMesh
//           geometry={nodes.Wolf3D_Hair.geometry}
//           material={materials.Wolf3D_Hair}
//           skeleton={nodes.Wolf3D_Hair.skeleton}
//         />
//         <skinnedMesh
//           geometry={nodes.Wolf3D_Body.geometry}
//           material={materials.Wolf3D_Body}
//           skeleton={nodes.Wolf3D_Body.skeleton}
//         />
//         <skinnedMesh
//           geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
//           material={materials.Wolf3D_Outfit_Bottom}
//           skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
//         />
//         <skinnedMesh
//           geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
//           material={materials.Wolf3D_Outfit_Footwear}
//           skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
//         />
//         <skinnedMesh
//           geometry={nodes.Wolf3D_Outfit_Top.geometry}
//           material={materials.Wolf3D_Outfit_Top}
//           skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
//         />
//       </Suspense>

//       {/* Load animations separately */}
//       <Suspense fallback={null}>
//         <AnimationLoader onLoad={setAnimations} />
//       </Suspense>
//     </group>
//   )
// })

// export default Character;
