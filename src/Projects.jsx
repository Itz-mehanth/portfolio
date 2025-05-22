// src/App.jsx
import { Clouds } from '@react-three/drei'
import {  Environment, Cloud, Stars} 
from '@react-three/drei'
import './App.css'
import Planet from './Planet'
import Asteroid from './Astroid'
import Effects from './Effects'

export default function Projects() {
    return (
    <>
        <Environment preset="night" intensity={0.1}></Environment>
        <ambientLight intensity={0.1} />
        <Effects/>
        <pointLight position={[0, 0, 500]} intensity={100} distance={100} decay={2} color="white" />

        <Stars radius={200} depth={1} count={1000} factor={10} saturation={1} fade speed={1} />
        <Stars radius={50} depth={10} count={1000} factor={10} saturation={1} fade speed={1} />
        <Stars radius={100} depth={10} count={100} factor={10} saturation={1} fade speed={1} />
        {/* <Stars radius={20} depth={1} count={1000} factor={10} saturation={1} fade speed={1} /> */}

        <Clouds position={[0, 0, 0]} >
          <Cloud segments={250} seed={8} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={7} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={6} scale={3} bounds={[100, -150, 300]} opacity={0.1} volume={250} color="white"  fade={100} />
          <Cloud segments={250} seed={5} scale={3} bounds={[100, -150, 500]} opacity={0.1} volume={250} color="white"  fade={100} />
        </Clouds>

        <Planet textureUrl='Planets/mars.jpg' radius={150} position={[0,-250,100]}/>

        <Asteroid position={[5, 0, 170]}/>
        <Asteroid position={[-5, 0, 150]}/>
        <Asteroid position={[5, 0, 120]}/>
        <Asteroid position={[-5, 0, 100]}/>
        <Asteroid position={[5, 0, 80]}/>
        <Asteroid position={[-5, 0, 60]}/>
        <Asteroid position={[5, 0, 40]}/>

        {/* <GroundPlane /> */}
        {/* <OrbitControls/> */}
    </>
    )
}