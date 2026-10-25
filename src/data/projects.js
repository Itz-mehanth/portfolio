// Single source of truth for every project: the flight world, the project index
// and the /projects/<slug> case-study pages all read from here.
//
// Required: slug, title, description, type ("live" | "github" | "linkedin"), z.
// Optional case-study fields, shown on the project page when present:
//   year:       "2025"
//   role:       "Solo developer" | "Team lead, 4 people"
//   stack:      ["React", "TensorFlow", ...]
//   problem:    one or two sentences on why it exists
//   built:      ["What you built", "Key technical decision", ...]
//   outcome:    the measurable result: users, accuracy, prize, latency...
//   image:      "/projects/<slug>.jpg" (put screenshots in public/projects/)
// z is the projects balloon position along the flight path.

export const PROJECTS = [
  {
    slug: "medplant",
    title: "MedPlant",
    description: "CNN-based plant identifier with medicinal insights.",
    type: "live",
    url: "https://medicinal-plant-82aa9.web.app/",
    repoUrl: "https://github.com/Itz-mehanth/MedPlant",
    z: 148,
  },
  {
    slug: "vroom",
    title: "VRoom",
    description: "Immersive 3D exploration and gardening.",
    type: "live",
    url: "https://vplants.vercel.app",
    repoUrl: "https://github.com/Itz-mehanth/VRoom",
    z: 162,
  },
  {
    slug: "retempla",
    title: "ReTempla",
    description: "SaaS for smart document formatting and personalization.",
    type: "live",
    url: "https://retempla.xyz/",
    repoUrl: "https://github.com/Itz-mehanth/Retempla",
    z: 240,
  },
  {
    slug: "livestock",
    title: "LiveStock",
    description: "Real-time data pipeline for processing and visualizing stock data.",
    type: "live",
    url: "https://streamtick.vercel.app",
    repoUrl: "https://github.com/Itz-mehanth/LiveStock",
    z: 256,
  },
  {
    slug: "galaxy-strike",
    title: "Galaxy Strike",
    description: "A retro-style 2D Java game built from scratch using Swing.",
    type: "linkedin",
    url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7261266876800868355",
    repoUrl: "https://github.com/Itz-mehanth/GalaxyStrike",
    z: 273,
  },
  {
    slug: "c-food-delivery-app",
    title: "C Food Delivery App",
    description: "Food Delivery App Simulation using C Language.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/FSDC-project",
    z: 290,
  },
  {
    slug: "xcng",
    title: "XCNG",
    description: "Real-time marketplace and community platform for campuses.",
    type: "live",
    url: "https://xcng.vercel.app",
    repoUrl: "https://github.com/Itz-mehanth/XCNG",
    z: 368,
  },
  {
    slug: "crown-of-sovereigns",
    title: "Crown of Sovereigns",
    description: "Stunning 3D strategy board game inspired by Carcassonne.",
    type: "live",
    url: "https://crownofsovereigns.netlify.app",
    repoUrl: "https://github.com/Itz-mehanth/CrownOfSovereigns",
    z: 385,
  },
  {
    slug: "vsce-extension",
    title: "VSCE Extension",
    description: "VS Code extension for interactive 360-degree HDR visualization.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/VSCE",
    z: 402,
  },
  {
    slug: "r3f-nav-controls",
    title: "R3F Nav Controls",
    description: "React component library for controls in 3D scenes.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/NPM-Package---R3F-Nav-Controls",
    z: 419,
  },
  {
    slug: "hospital-management",
    title: "Hospital Management",
    description: "Robust desktop application for efficient healthcare management.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/DBMS_Hospital_Management",
    z: 500,
  },
  {
    slug: "aura-ai-agent",
    title: "Aura AI Agent",
    description: "Voice-activated AI personal assistant leveraging advanced ML models.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/Aura-AI-Agent",
    z: 528,
  },
  {
    slug: "ar-ludo-game",
    title: "AR Ludo Game",
    description: "Augmented reality version of Ludo built with Unity and Vuforia.",
    type: "linkedin",
    url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7298710253531971584",
    repoUrl: "https://github.com/Itz-mehanth/LudoGameAR",
    z: 556,
  },
  {
    slug: "ssn-tour",
    title: "SSN Tour",
    description: "Immersive 3D virtual tour of SSN College of Engineering.",
    type: "live",
    url: "https://ssntour.vercel.app",
    repoUrl: "https://github.com/Itz-mehanth/SSN_Tour",
    z: 584,
  },
  {
    slug: "arise",
    title: "Arise",
    description: "Gamified Learning Platform for Rural Education.",
    type: "live",
    url: "https://ariseedu.vercel.app",
    repoUrl: "https://github.com/Itz-mehanth/Arise_SIH2025",
    z: 612,
  },
  {
    slug: "gh9-b",
    title: "GH9-B",
    description: "Immersive 3D survival horror experience built for the web.",
    type: "live",
    url: "https://gh9b.games.mehanth.site",
    repoUrl: "https://github.com/Itz-mehanth/GH9B",
    z: 640,
  },
  {
    slug: "3d-wallpaper",
    title: "3D Wallpaper",
    description: "Meta Quest 3-style 3D desktop environment with window capture.",
    type: "github",
    repoUrl: "https://github.com/Itz-mehanth/3DWallpaper",
    z: 668,
  },
];

export const getProjectBySlug = (slug) => PROJECTS.find((project) => project.slug === slug) || null;
