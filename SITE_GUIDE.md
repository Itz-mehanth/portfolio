# mehanth.site — Site Guide

What is on every screen of the portfolio, how it moves, and which file builds it.
**Keep this file in sync with the code:** every change to a section, its
content, its controls or the motion system should update the matching part of
this guide in the same commit.

_Last updated: 2026-10-29 (depth-deck redesign; Home hero is 3D type; HandForge is the lead project)._

---

## Contents

1. [How the site is put together](#1-how-the-site-is-put-together)
2. [Moving between sections](#2-moving-between-sections)
3. [Always on screen](#3-always-on-screen)
4. [01 · Home](#4-01--home)
5. [02 · Skills — Skill Town](#5-02--skills--skill-town)
6. [03 · Work — the flight world](#6-03--work--the-flight-world)
7. [Project index and case-study pages](#7-project-index-and-case-study-pages)
8. [04 · Awards](#8-04--awards)
9. [05 · Contact](#9-05--contact)
10. [Visual system](#10-visual-system)
11. [Performance and loading](#11-performance-and-loading)
12. [Accessibility and reduced motion](#12-accessibility-and-reduced-motion)
13. [Phones and tablets](#13-phones-and-tablets)
14. [File map](#14-file-map)
15. [Content you still need to add](#15-content-you-still-need-to-add)

---

## 1. How the site is put together

The site is a single page made of **five full-screen sections**. Only one is on
screen at a time, and the address bar follows along:

| # | Section | URL | Nav label | 3D scene? |
|---|---|---|---|---|
| 01 | Home | `/` | Home | No. CSS 3D type only |
| 02 | Skills (Skill Town) | `/skills` | Skills | **Yes** (WebGL town) |
| 03 | Work (flight world) | `/projects` | Work | **Yes** (WebGL flight) |
| 04 | Awards | `/certificates` | Awards | No |
| 05 | Contact | `/contact` | Contact | No |

Each project also has its own address: `/projects/<slug>` (for example
`/projects/arise`). Opening one directly lands you on Work with that project's
page open. Browser back and forward work everywhere.

Only the section you are on, plus the one you are moving to, are mounted. When
a move finishes, the section you left is unmounted, so no more than one heavy 3D
scene is ever alive at a time.

Defined in `src/App.jsx` (`SCREEN_DEFINITIONS`, `navigateToScreenIndex`).

---

## 2. Moving between sections

### Ways to move
- **Navbar** (top right): Home · Skills · Work · Awards · Contact.
- **Section rail** (right edge, desktop): five dots; hover shows `01 · Home` and
  so on; the active one is a tall ink bar.
- **Mouse wheel / trackpad:** one gesture moves exactly one section. Trackpad
  inertia can't skip sections, and a small reversal mid-gesture doesn't count.
- **Swipe** (phones): one swipe moves one section.
- **Keyboard:** Page Up / Page Down everywhere. The arrow keys also work, except
  on Skills and Work, where they steer the car and the plane.
- **Buttons:** "View work" on Home jumps straight to Work.

Scrollable content is scrolled first. On Awards, Contact and the taller phone
layouts, the wheel or swipe scrolls the content until it reaches the end, and
only then changes section. Drags that start on a 3D scene (orbiting, the
joystick, driving) never change section.

### The "depth deck" transition (the site's signature motion)
Every section is a **sheet lying in one shared 3D space**:

1. **Leaving:** the current sheet tilts back about 14°, shrinks and falls away
   into depth (accelerating, about 0.95 s).
2. **Arriving:** the next sheet starts below, tilted the other way and set back
   in depth, then rises and settles flat (decelerating, about 1.2 s). Moving
   backwards plays this in reverse: the earlier section comes down from above.
3. **Between the sheets** you briefly see the "table" they lie on (a slightly
   darker paper) and the sheets' soft shadows.
4. **Layered arrival:** inside each sheet, blocks sit on depth layers (`--d`
   from 0 to 5). Deeper layers start further away and land later, so the small
   label arrives first, then the title, then the body, then the details.
5. **Cursor parallax:** while you are on a section, moving the mouse makes
   those layers drift against each other, with deeper layers moving more.

Navigation is locked for about 0.76 s while sheets are moving, so fast scrolling
can't stack moves. While a section's code or 3D models are still downloading,
the move waits at most 0.22 s and then goes anyway.

Built in: `src/Motion.css` (layers, parallax, stage) and `getScreenStyle` /
`screenClass` in `src/App.jsx` (sheet poses and timing). Mouse position is eased
in JavaScript and written to the CSS variables `--mx` and `--my` on the app
root, so mouse movement never re-renders React.

---

## 3. Always on screen

- **Navbar** (`Navbar` in `App.jsx`, `src/Navbar.css`):
  - "Mehanth" with the site's one amber dot.
  - A glass pill of section links; the active one has an ink fill that slides
    between links.
  - A fullscreen toggle.
  - On phones it collapses to a hamburger menu.
- **Section rail** (`NavDots` in `App.jsx`): desktop only, described above.
- **Tour guide** (`src/TourGuide.jsx`): the round ink chat button at bottom
  left opens a short guided tour: three steps on Home, two each on Skills and
  Work, and one each on Awards and Contact:
  - Welcome
  - The Hero
  - Download CV
  - Skill Town
  - Drive Mode
  - Project Orbit
  - Live Preview
  - Achievements
  - Let's Connect

  Each step can move you to its section. It's hidden while a project page is
  open.
- **Device preview** (`src/DevicePreview.jsx`): opens over everything when you
  press "Preview" on a live project. It shows the project's site inside an
  iPhone, iPad or MacBook frame, and you can switch between them.

---

## 4. 01 · Home

File: `src/HomeHero.jsx` · styles: `src/Home.css` · no WebGL.

An editorial, near-monochrome composition. From top to bottom:

| Element | What it is | Depth layer |
|---|---|---|
| Top rule | A thin line with three labels: **"Mehanth — Portfolio 2026"**, **"Full-stack & 3D web developer"**, **"Chennai · Bangalore"** (the third is hidden on phones) | 1 |
| **3D name** | "Mehanth" as real 3D type (see below) | its own entrance |
| Lede | "I build fast, interactive 3D experiences for the web. Software Engineer Intern at VISA, Computer Science at SSN." | 2 |
| Buttons | **View work** (ink, goes to Work) and **Download CV** (outline, opens the CV on Google Drive in a new tab) | 3 |
| Social links | GitHub ↗ · LinkedIn ↗ · Instagram ↗ · Email ↗ (underline on hover) | 3 |
| Scroll cue | "SCROLL" over a thin line that draws itself downward on a loop (desktop only) | 1 |
| Drafting grid | Faint 80 px grid lines fading out at the edges, drifting on a deep layer | 4 |
| "01" numeral | A huge outlined "01" in the bottom-right corner, barely visible, on the deepest layer | 5 |

### The 3D name
- It is built from **twelve stacked copies** of the word inside a CSS
  `preserve-3d` stage. Each copy sits 2.4 px further back and is a slightly
  lighter grey, so the name has real thickness, like a block cut from paper
  stock, and the face is solid ink.
- It **tilts with the mouse**: up to about 16° up or down and 22° left or
  right, around a slight resting tilt of 6°, so the extruded sides show as you
  move.
- **Entrance:** arriving on Home, the name swings up from lying nearly flat
  (−72°) into place over about 1.5 s. Leaving, it tips away in the other
  direction.
- Under "reduce motion", the name stays still at its resting tilt.

There is no photo of you on Home. It was removed on purpose in the redesign.

---

## 5. 02 · Skills — Skill Town

File: `src/Skills.jsx` · models: `src/utils/models/*` · **WebGL**.

### Layout
- A heading **"02 · Skills"** and the title **"Skill Town"** (layer 1).
- Below it, the **3D town** fills the rest of the screen in a rounded panel.
- A **skills card** floats over the bottom-left corner of the town.

### The town
- A low-poly island town. Each **district is one skill area**, marked by a
  house with a sign: Languages, Web, Mobile, Backend, Database, AR/VR, UI/UX,
  Tools and AI/ML.
- Around the districts: water tanks, windmills, trees and a road the car drives
  along.
- **Click a district** and the car drives there along the road; the skills card
  switches to that district.
- **Camera:** you can rotate, pan and zoom it (zoom 5–60 units; you can't look
  from below the ground). On arrival, the camera swoops down from high above
  into the overview (`src/utils/CameraEntrance.jsx`).
- On portrait screens the view widens, so the whole town stays in frame
  (`src/utils/useResponsiveFov.js`).
- The scene only renders while it's on screen.

### Skills card (floating, translucent white)
Shows the selected district's name and its skills as small chips. Hover a chip
to see a one-line description. It hides while you're driving.

| District | Skills |
|---|---|
| Languages | Python, JavaScript, TypeScript, Dart, C, C++, Java, SQL |
| Web | HTML, CSS, Tailwind CSS, React.js, Next.js, Vue.js, Angular, Chart.js |
| Mobile | Flutter |
| Backend | Node.js, Express.js, Flask, Spring Boot, REST API, WebSockets, WebRTC, Apache Kafka, Apache Spark |
| Databases | PostgreSQL, MySQL, MongoDB, Redis |
| AR / VR & 3D | React Three Fiber, Three.js, Unity, Godot, Blender |
| UI / UX | Figma |
| Tools | Docker, Git, Firebase, Raspberry Pi, PySpark, Spark Streaming, Spark MLlib |
| AI / ML | TensorFlow, OpenCV, CNNs |

### Drive mode
- The **"Drive the car"** button (ink pill, top right of the town) hands you the
  car.
- **Desktop:** drive with WASD or the arrow keys. A small hint shows the
  controls.
- **Phones:** a joystick appears bottom left.
- Press **"Exit drive mode"** to return to the overview camera.

---

## 6. 03 · Work — the flight world

Files: `src/ProjectsStage.jsx` (canvas), `src/Projects.jsx` (worlds and
balloons), `src/Airplane.jsx` (your plane and cameras), `src/Blaster.jsx`,
`src/CoinField.jsx`, `src/CockpitControls.jsx` · project data:
`src/data/projects.js` · **WebGL**.

The section is one large dark rounded stage (layer 1) holding a 3D flight
through five worlds, with your projects floating along the route as balloons.

### Your craft
A **paper airplane** (`public/models/paper_airplane.glb`), seen from behind in
the chase camera. Boosting makes the paper flutter harder. Its colour follows
the hull colour picked in the cockpit panel.

### The route (front to back)
1. **Dawn:** warm peach sky; the start.
2. **Ocean:** bright blue sea and sky.
3. **Desert:** orange dunes.
4. **City:** a night city in deep blue and violet.
5. **Space:** dark space at the end of the route.

Clouds, light and fog blend between worlds as you fly. **Portals** at four
points along the route pull you in, centre you and give you a speed boost
through to the next world.

### Controls
| Action | Desktop | Phone |
|---|---|---|
| Fly forward / back | W / S or ↑ / ↓ | Joystick (bottom left) |
| Bank left / right | A / D or ← / → | Joystick |
| Climb | Space | ↑ button (bottom right) |
| Descend (also speeds up) | Shift | ↓ button |
| Fire | F | FIRE button |

A hint box at the top ("WASD fly · Space/Shift up/down · F fire / Fly up to a ✦
balloon to open a project") fades out after a few seconds.

### Projects along the route
Each project with a public link is a **balloon** placed along the route,
alternating left and right. Fly up to one, or shoot it with F, to pop open its
banner. The banner shows:
- the title
- the description
- a type badge: LIVE PROJECT, OPEN SOURCE or SHOWCASE
- buttons: **Visit Live** (opens the device preview), **View Code** or **View Post**

Balloon styles go diamond, then gold, then platinum along the route. Coins along
the way count up as you collect them (the score display is currently hidden).

### Cockpit controls (button top left: "ENTER COCKPIT")
- **Camera views:** Cockpit (first person, inside the old jet cockpit), Chase
  (default), Top, Left, Right, Front.
- **Hull colours:** Titanium, Crimson, Ion Blue, Solar Gold, Emerald, Plasma,
  Lime, Stealth.

### "All projects" button (top right of the stage)
Opens the plain project list (section 7), so nobody has to fly to see your work.

---

## 7. Project index and case-study pages

File: `src/ProjectPages.jsx` · styles: `src/ProjectPages.css`.

- **All projects** (dark overlay over the whole site): every project as a card
  in a grid. Each card has a type tag, title, one-line description and
  "Read more", plus Preview / Live site / Code buttons when those exist.
  Escape closes it.
- **Case-study page** (`/projects/<slug>`, also a dark overlay):
  - the type and year
  - the title in large display type
  - the description
  - Preview / Live site / Code buttons
  - and, when filled in, a screenshot, the tech stack, **The problem**, **What
    I built** (bullets) and **Outcome** (large text)

  At the bottom, **Next project** goes to the following one. The browser tab
  title changes to the project's name. While you're running the dev server, a
  dashed note lists which write-up fields a project is still missing; visitors
  never see it.

### The projects (in order)
| # | Project | Type | Links | Balloon? |
|---|---|---|---|---|
| 1 | **SURGE: Hands of Heroes** (HandForge): hands-only mixed-reality hero combat for Meta Quest, built on WebXR | WebXR · Mixed reality | none yet (repo is private) | No |
| 2 | MedPlant: CNN plant identifier with medicinal insights | Live | site + code | Yes |
| 3 | VRoom: immersive 3D exploration and gardening | Live | site + code | Yes |
| 4 | ReTempla: SaaS for smart document formatting | Live | site + code | Yes |
| 5 | LiveStock: real-time stock data pipeline | Live | site + code | Yes |
| 6 | Galaxy Strike: retro 2D Java game | Showcase | LinkedIn post + code | Yes |
| 7 | C Food Delivery App | Open source | code | Yes |
| 8 | XCNG: campus marketplace | Live | site + code | Yes |
| 9 | Crown of Sovereigns: 3D strategy board game | Live | site + code | Yes |
| 10 | VSCE Extension: 360° HDR viewer for VS Code | Open source | code | Yes |
| 11 | R3F Nav Controls: React 3D controls library | Open source | code | Yes |
| 12 | Hospital Management | Open source | code | Yes |
| 13 | Aura AI Agent: voice assistant | Open source | code | Yes |
| 14 | AR Ludo Game: Unity + Vuforia | Showcase | LinkedIn post + code | Yes |
| 15 | SSN Tour: 3D virtual campus tour | Live | site + code | Yes |
| 16 | Arise: gamified rural learning (SIH 2025) | Live | site + code | Yes |
| 17 | GH9-B: 3D survival horror | Live | site + code | Yes |
| 18 | 3D Wallpaper: Quest-3-style 3D desktop | Open source | code | Yes |

Only SURGE has a full write-up (problem, six "What I built" points, stack).
Every other project shows just its one-line description until you add more (see
section 15).

---

## 8. 04 · Awards

File: `src/Certificates.jsx` · styles: `src/Awards.css` · no WebGL.

- **Heading** (layer 1): "04 · Awards", the title **"Proof of work"**, and
  "Three hackathon wins in 2026, and the certifications behind the
  fundamentals."
- **Hackathons** (layer 2): three white cards, each with a faint large number,
  an ink badge, the title, venue · year, and the story behind it.
  - **1st Place:** Data Sprint 3.0, Sri Sairam Engineering College, 2026: "Won
    the hackathon on my birthday. 40+ teams sang happy birthday at midnight."
  - **Best Performance:** TechathonX 2026, Prathyusha Engineering College:
    "Powered by pure sleep deprivation. Last-minute ideas actually work."
  - **Winner:** Impact Nexus, SSN College of Engineering, 2026: "Won at our own
    college with an Agentic Ads Platform."
- **Certifications** (layer 3): three rows, each with the title, issuer · year ·
  note, a large score, and a **View ↗** link to the certificate on Google Drive.
  - Top 1% NPTEL C++: **92%**
  - Top 5% Competitive Programming (NPTEL): **85%**
  - UI/UX Design Figma (Cybernaut): **Certified**

Cards rise in one after another and lift on hover. The section scrolls on its
own when it is taller than the screen.

---

## 9. 05 · Contact

Component: `ContactSection` in `src/App.jsx` · styles: `src/Contact.css` · no WebGL.

Two columns on desktop, stacked on phones.

**Left (layer 1)**
- "05 · Contact", then **"Let's build something unforgettable."** (the last
  word in grey).
- "Got a project, a hackathon squad, or just want to say hi? I usually reply
  within a day."
- A green pulsing dot: "Available for opportunities".
- Email: **mehanth362@gmail.com** (opens your mail app).
- Based in: **Bangalore, India · SWE Intern @ VISA**.
- Pill links: LinkedIn, GitHub, Instagram.

**Right (layer 2): message form**
- Fields: Your Name (2+ characters), Email Address (checked for a valid
  format), Project Details (10+ characters). Errors appear under each field.
- **Send Message** (ink button) submits to a Google Apps Script, which records
  the message. The button shows "Sending…" while it works.
- On success, a green "Message sent!" banner shows for 5 seconds and the form
  clears. A red banner shows if sending fails.

---

## 10. Visual system

Defined in `src/index.css` (tokens) and `src/App.css` (shared type).

- **Palette (near-monochrome):** ink `#0d0d0f`, paper `#f4f3ef`, greys for
  secondary text and lines. **Amber appears in one place only:** the dot beside
  "Mehanth" in the navbar. Colour on the site comes from the 3D worlds in Skills
  and Work.
- **Type:** Syne for display (the name, section titles, scores) and Poppins for
  everything else. These are the only two fonts loaded.
- **Section headings:** a small grey uppercase label (`.section-eyebrow`, e.g.
  "02 · Skills") over a large Syne title (`.section-title`).
- **Shapes:** rounded panels (20–24 px), pill buttons, thin 1 px lines.
- **Focus:** a 2 px ink outline on every keyboard-focused control.

---

## 11. Performance and loading

- **First load is HTML-light:** about 126 KB of compressed JavaScript (React,
  the animation library and the app). No 3D library loads for Home, Awards or
  Contact.
- **3D loads on demand:** the Skills and Work code and models download when you
  head there, or in idle time while you're on the section before. Models are
  cached and reused.
- Each 3D scene renders at a fixed resolution (no flicker from resolution
  switching), pauses when it's off screen, and **recovers automatically** if the
  graphics card drops it.
- The Skills and Work canvases size themselves from the panel's real layout,
  not from its tilted shape mid-transition.

---

## 12. Accessibility and reduced motion

- With **"reduce motion"** turned on:
  - sections cross-fade instead of tilting
  - layers don't move, and there's no mouse parallax
  - the 3D name stays still
  - camera swoops are skipped
- Every interaction works from the keyboard (Page Up / Page Down between
  sections; Escape closes the project overlays). Overlays are proper dialogs
  that take focus and hand it back when they close.
- Body text meets AA contrast. Social and navigation controls have accessible
  labels.

---

## 13. Phones and tablets

- Touch devices are detected by pointer type, so iPads count too.
- Home stacks into one column, the name shrinks to fit, and the scroll cue hides.
- **Skill Town** fills the screen width; the skills card spans the bottom edge;
  orbiting and driving never swipe you to another section.
- **Work** goes edge to edge below the navbar, with a larger joystick plus FIRE,
  ↑ and ↓ buttons. The controls are touch-locked so the browser can't steal the
  drag.
- Awards and Contact scroll within themselves before a swipe changes section.

---

## 14. File map

| Area | Files |
|---|---|
| App shell, navigation, Home section, Contact | `src/App.jsx`, `src/App.css`, `src/Navbar.css`, `src/index.css` |
| Motion system | `src/Motion.css` (+ `getScreenStyle` / `screenClass` in `App.jsx`) |
| Home | `src/HomeHero.jsx`, `src/Home.css` |
| Skills | `src/Skills.jsx`, `src/utils/models/*`, `src/utils/CameraEntrance.jsx`, `src/utils/useResponsiveFov.js` |
| Work | `src/ProjectsStage.jsx`, `src/Projects.jsx`, `src/Airplane.jsx`, `src/Astroid.jsx` (balloons), `src/Blaster.jsx`, `src/CoinField.jsx`, `src/Coin.jsx`, `src/CockpitControls.jsx`, `src/utils/useKeyboard.jsx` |
| Project pages | `src/ProjectPages.jsx`, `src/ProjectPages.css`, `src/data/projects.js` |
| Awards | `src/Certificates.jsx`, `src/Awards.css` |
| Contact | `ContactSection` in `src/App.jsx`, `src/Contact.css` |
| Shared overlays | `src/TourGuide.jsx`, `src/DevicePreview.jsx` |
| Loading | `src/preloadAssets.js`, `vite.config.js` (chunking) |
| Models | `public/models/*.glb` |

---

## 15. Content you still need to add

- **Project write-ups:** in `src/data/projects.js`, add `problem`, `built`,
  `outcome`, `stack` and `image` for your top 3–5 projects. Only SURGE has these
  so far.
- **SURGE links:** its Vercel URL, or make the `MetaHack` repo public. Then it
  gets Live / Code buttons and a balloon in the flight world.
- **SURGE outcome:** once the Meta VR competition results are out (deadline
  Nov 18, 2026).
- **3D model credits:** the authors and licences of the models in
  `public/models/`, for the README. Award juries check for these.
