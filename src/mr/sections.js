// The five portfolio sections as mixed-reality worlds. Each one tears into the
// viewer's real room with its own sky (HandForge's WorldLook: gradient, clouds or
// nebula, stars, a sun or ringed planet, a burning rift edge), and has its own
// travel tunnel for the jump there.
//   rift: how much of the room the world eats through in passthrough (0..0.6);
//         in VR (no passthrough) the world is the whole sky.

export const SECTIONS = [
  {
    id: 'home',
    number: '01',
    label: 'Home',
    title: 'The paper rift',
    rift: 0.46,
    transit: 'warp',
    colors: ['#FFC857', '#7A3CFF'],
    look: {
      top: '#07031A', horizon: '#FFC857', ground: '#05020F', cloud: '#3A1A7A', accent: '#F59E0B',
      planet: '#FFE8A8', planetDir: [0.35, 0.32, -0.88], planetSize: 0.13, ring: true, stars: 1,
    },
  },
  {
    id: 'skills',
    number: '02',
    label: 'Skills',
    title: 'Skill Town',
    rift: 0.4,
    transit: 'sky',
    colors: ['#BFE9FF', '#3FA6E6'],
    look: {
      top: '#3FA6E6', horizon: '#DFF4FF', ground: '#1677C2', cloud: '#FFFFFF', accent: '#FFF1C4',
      planet: '#FFF8DC', planetDir: [-0.45, 0.62, -0.64], planetSize: 0.07, ring: false, stars: 0,
    },
  },
  {
    id: 'work',
    number: '03',
    label: 'Work',
    title: 'The flight world',
    rift: 0.44,
    transit: 'wormhole',
    colors: ['#FFB36B', '#FF4F8B'],
    look: {
      top: '#2A1A5E', horizon: '#FFB36B', ground: '#3A1C3A', cloud: '#FF8FB3', accent: '#FF6A3D',
      planet: '#FFD9A0', planetDir: [0.2, 0.1, -0.97], planetSize: 0.11, ring: false, stars: 0.45,
    },
  },
  {
    id: 'awards',
    number: '04',
    label: 'Awards',
    title: 'Proof of work',
    rift: 0.38,
    transit: 'fire',
    colors: ['#FFD27A', '#B5651D'],
    look: {
      top: '#4A2E0E', horizon: '#FFD98A', ground: '#2E1D0A', cloud: '#FFCF6B', accent: '#FFB51B',
      planet: '#FFF1C2', planetDir: [0.5, 0.42, -0.75], planetSize: 0.09, ring: true, stars: 0.3,
    },
  },
  {
    id: 'contact',
    number: '05',
    label: 'Contact',
    title: "Let's build",
    rift: 0.36,
    transit: 'sky',
    colors: ['#FFE3B0', '#FF9F5A'],
    look: {
      top: '#7FB7E6', horizon: '#FFE3B0', ground: '#5F8F4F', cloud: '#FFF4DC', accent: '#FFB066',
      planet: '#FFF8E0', planetDir: [-0.6, 0.45, -0.66], planetSize: 0.08, ring: false, stars: 0,
    },
  },
]
