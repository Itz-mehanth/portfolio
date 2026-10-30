# mehanth.site — Site Guide

What is on every screen of the portfolio, how it moves, and which file builds it.
**Keep this file in sync with the code:** every change to a section, its
content, its controls or the motion system should update the matching part of
this guide in the same commit.

_Last updated: 2026-10-30 (one continuous scrolling page with torn-paper seams; Skills, Awards and Contact closer to the reference image)._

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

The site is **one continuous scrolling page** made of five sections, joined by
seams instead of hard borders. The address bar follows whichever section is in
the middle of the screen:

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

The two WebGL sections (Skills, Work) mount when they come within a screen of
the viewport and unmount when you scroll far away. Home, Awards and Contact are
light and always mounted.

Defined in `src/App.jsx` (`SCREEN_DEFINITIONS`, `navigateToScreen`,
`scrollToScreen`, the scroll and intersection effects).

---

## 2. Moving between sections

### Scrolling
- The page scrolls natively: wheel, trackpad, touch swipes, keyboard (Page
  Up/Down, Space, arrows outside Work) and the scrollbar all work as on any
  page. Nothing jumps or locks.
- **Navbar, section rail, tour guide and "View work"** glide smoothly to their
  section, and add a browser history entry.
- While you scroll, the section holding the middle of the screen becomes the
  active one: the navbar pill, the rail and the URL follow it (the URL is
  replaced, not pushed, so scrolling doesn't flood your history).
- **Back / forward** glide to the section in the URL. **Deep links**
  (`/skills`, `/certificates`, `/projects/arise`…) open at that section.
- The 3D scenes never trap the scroll: Skill Town's camera doesn't zoom on the
  wheel and has no drag-orbit on touch screens; the flight world has no hidden
  scroll layer; flight keys only respond while Work is on screen and never
  while you type.

### Seams: no straight borders between sections
Between every pair of sections sits a seam (`src/Seams.jsx`, `src/Seams.css`):
a zero-height strip drawn above both sections, so its pieces overlap the end of
one and the start of the next.

| Between | What's there |
|---|---|
| Home → Skills | Home's paper **tears open** onto Skill Town's sky (white fibrous rim, soft shadow); low-poly rocks and clouds cross the tear |
| Skills → Work | A **torn strip of paper** lies across the boundary; clouds and rocks hang off it |
| Work → Awards | Awards' paper **rises over** the flight world with a torn top edge; rocks, a paper airplane and a gold coin cross it |
| Awards → Contact | Same paper, no edge at all: plant leaves reach across from the sides |

Each prop has its own scroll speed, so as you scroll they drift at different
rates against the page: that parallax is what makes the seams feel like depth.
The torn sheets fade out on their flat side, so only the tear reads.

### Reveals and parallax inside sections
- Blocks marked `.layer` (with a depth `--d`, 0–5) are hidden until their
  section first scrolls into view, then rise in: deeper layers travel further
  and land later.
- While you're on a section, the mouse makes those layers drift slightly
  against each other (deeper layers move more).
- Built in `src/Motion.css`; mouse position is eased in JavaScript and written
  to the CSS variables `--mx` / `--my`, so mouse movement never re-renders React.

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

Files: `src/HomeHero.jsx`, `src/Home.css`, `src/HeroRift.jsx` (the space
cutaway), `src/Scribble.jsx` (margin notes).

A warm editorial paper sheet with a faint drafting grid, in two halves.

### Left: the hero copy
| Element | What it is | Depth layer |
|---|---|---|
| Eyebrow | **"01 · Home"** | 0 |
| Greeting | **"HI, I'M"** in amber | 1 |
| **3D name** | "Mehanth" as real 3D type (see below) | its own entrance |
| Role | **"Full-stack & 3D web developer"** | 1 |
| Intro | "I build fast, interactive 3D experiences for the web. Software Engineer Intern at VISA, Computer Science at SSN." | 2 |
| Status pill | A green dot and **"Currently interning @ VISA, Bangalore"** | 2 |
| Buttons | **Download CV** (amber, primary; opens the CV on Google Drive) and **View work →** (outlined; goes to Work) | 3 |
| Social icons | GitHub, LinkedIn, Instagram, Email as square icon buttons, each with an accessible label and tooltip | 3 |
| Margin note | "Welcome to my world", handwritten, with a drawn arrow (wide screens only) | none |
| Scroll cue | "SCROLL" over a line that draws itself downward (desktop only) | 1 |

### Right: the space cutaway
- The paper behind the hero is torn open, with a jagged, burning amber edge,
  onto a living alien sky (`HeroRift.jsx`, raw WebGL, no three.js):
  - a violet nebula spiralling into a bright core
  - stars streaming out toward you
  - a turning ringed planet
  - two small planets, terracotta and gold, on tilted orbits that pass behind
    and in front of it
- **Parallax:** the hole stays fixed to the page while the sky inside moves
  with the mouse, so it reads as depth. Embers drift off the rim.
- It loads only after the HTML has painted, pauses when you leave Home, and
  shows one still frame under reduced motion.
- **A paper airplane** (an SVG) drifts out of the cutaway, pointing toward the
  Work section.
- On phones the cutaway sits in the top-right corner, above the copy.

There is no profile photo on Home; the current design doesn't use one.

### The 3D name
- Built from **twelve stacked copies** of the word inside a CSS
  `preserve-3d` stage. Each copy sits 2.2 px further back and is slightly
  lighter, so the name has real thickness, with a solid ink face.
- It **tilts gently with the mouse** (about 10° up/down and 14° left/right,
  around a 5° resting tilt) and stays readable.
- **Entrance:** arriving on Home, it swings up from nearly flat (−74°) and
  settles with a slight overshoot.
- Under "reduce motion" it stays still.

---

## 5. 02 · Skills — Skill Town

Files: `src/Skills.jsx` (scene, districts, camera, drive mode, skills card),
`src/SkillIsland.jsx` (island, sea, layout), `src/utils/models/*` (house, water
tank, tree, windmill, car) · **WebGL**.

### Layout
- The 3D island fills the whole section.
- A soft sky haze on the left carries an editorial column:
  - **"02 · Skills"**, the title **"Skill Town"**, and "Explore the different
    areas I work with. Click any house to see the skills in that district."
  - Below it, the **skills card** for the selected district.
- A handwritten margin note, "Different skills, same destination", sits beside
  the title (wide screens only).
- On wide screens the camera view is shifted, so the island sits on the right,
  clear of the column.
- **"Drive the car"** (ink pill) is at the top right.

### The island (`SkillIsland.jsx`)
Built from cheap procedural geometry plus the existing models:
- **Two terraces:** a grassy top with terracotta cliffs, and a wider sandy
  terrace with darker cliffs below it, so the coast steps down like the
  reference. The coastline is an ellipse with a gentle wobble.
- **Ring road:** a sandy oval road around the island.
- **Nine districts** (Languages, Web, Mobile, Backend, Database, AR/VR, UI/UX,
  Tools, AI/ML) evenly spaced along the road's outer edge. Each has a house, a
  water tank and a dark sign board facing the camera.
- **Central park:** trees and two water tanks inside the ring, a few rocks, and
  a ring of trees around the outer edge.
- **Two windmills** on the back edge.
- **Sea:** turquoise in the shallows, blue further out. A white foam line
  breathes at the shore, and small glints drift near the island. The far edge
  fades into the sky.
- **Waterfall:** pours over the front-left cliff, with a splash at its foot.
- **Wooden dock and boat:** a dock at the front right, and a small sailboat that
  bobs and rocks beside it.
- **Clouds:** a few low-poly clouds drifting slowly behind the island (skipped
  in low-power mode).
- A flat **amber ring** pulses under the selected district.

### Interaction
- **Click a house:** that district becomes selected, its sign highlights, the
  amber ring moves under it, and the car drives there along the ring road, the
  shorter way round.
- **Camera:** drag to rotate or pan it on desktop. There's no wheel zoom (the
  wheel scrolls the page) and no drag-orbit on touch screens (a swipe scrolls
  the page; taps still select houses). On arrival the camera swoops down from high above
  (`src/utils/CameraEntrance.jsx`). On portrait screens the view widens
  (`src/utils/useResponsiveFov.js`). The scene only renders while it's on screen.
- **Phones:** the column becomes a compact title at the top and the skills card
  along the bottom, with the island between them.

### Skills chips (in the left column)
The selected district's name, then its skills as white pills straight on the sky. Hover a chip to see
a one-line description. It hides while you're driving.

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
- **"Drive the car"** hands you the car. Drive with WASD or the arrow keys on
  desktop, or the joystick on phones.
- Solid ground follows the island's real coastline: drive off the edge and you
  fall, then respawn at the Languages district.
- The car bumps off the houses.
- Press **"Exit drive mode"** to return to the overview camera.

---

## 6. 03 · Work — the flight world

Files: `src/ProjectsStage.jsx` (canvas), `src/Projects.jsx` (worlds and
balloons), `src/Airplane.jsx` (your plane and cameras), `src/Blaster.jsx`,
`src/CoinField.jsx`, `src/CockpitControls.jsx` · project data:
`src/data/projects.js` · **WebGL**.

The flight world fills the whole sheet. A soft paper corner at the top left
carries the editorial header (layer 1):
- **"03 · Work"** and the title **"The flight world"**.
- "Fly through my projects. Each balloon is a project with its story and links."
- Two buttons: **Enter cockpit** (ink; toggles the cockpit panel and becomes
  "Exit cockpit") and **All projects** (outlined; opens the plain project list).
- A handwritten margin note, "From ideas to real projects" (wide screens only).

Only the header's buttons take clicks, so flying is never blocked. On phones the
header shrinks to the title and the two buttons.

### Your craft
A **paper airplane** (`public/models/paper_airplane.glb`), seen from behind in
the chase camera, about 3.4 units long. The flight scene is lit very brightly,
so the paper's base colour is scaled down until it shades instead of clipping to
flat white; you can see its folds. Boosting makes the paper flutter harder. Its
colour follows the hull colour picked in the cockpit panel.

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

### Cockpit controls ("Enter cockpit" in the header)
The panel opens at the bottom left:
- **Camera views:** Cockpit (first person, inside the old jet cockpit), Chase
  (default), Top, Left, Right, Front.
- **Hull colours:** Titanium, Crimson, Ion Blue, Solar Gold, Emerald, Plasma,
  Lime, Stealth.

### "All projects" (in the header)
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

Files: `src/Certificates.jsx`, `src/Awards.css` · no WebGL.

A warm paper sheet, left-aligned like the other sections.

- **Header** (layer 1): "04 · Awards", the title **"Proof of work"**, and
  "Three hackathon wins in 2026, and the certifications behind the
  fundamentals." A margin note reads "Recognitions that push me forward"
  (wide screens only).
- **Hackathons** (layer 2): three cream cards, each with:
  - a small gold mark (trophy for first place, then a medal and an award
    ribbon)
  - an ink badge
  - a faint large number in the corner
  - the title, venue · year, and the story

  The three wins:
  - **1st Place:** Data Sprint 3.0, Sri Sairam Engineering College, 2026:
    "Won the hackathon on my birthday. 40+ teams sang happy birthday at
    midnight."
  - **Best Performance:** TechathonX 2026, Prathyusha Engineering College:
    "Powered by pure sleep deprivation. Last-minute ideas actually work."
  - **Winner:** Impact Nexus, SSN College of Engineering, 2026: "Won at our own
    college with an Agentic Ads Platform."
- **Certifications** (layer 3): three cards in a row (stacked on phones), each
  with a gold star, the title, issuer · year · note, the score at the top right,
  and a **View ↗** link to the certificate on Google Drive.
  - Top 1% NPTEL C++: **92%**
  - Top 5% Competitive Programming (NPTEL): **85%**
  - UI/UX Design Figma (Cybernaut): **Certified**

Cards rise in one after another and lift on hover.

**Desk props** (wide screens only): a tilted framed certificate with a gold
medal on red and blue ribbons, and a gold coin, at the top right
(`src/DeskProps.jsx`).

---

## 9. 05 · Contact

Component: `ContactSection` in `src/App.jsx` · styles: `src/Contact.css` ·
props: `src/DeskProps.jsx` · no WebGL.

Two columns on desktop, stacked on phones.

**Left (layer 1)**
- "05 · Contact", then **"Let's build something unforgettable."** (the last
  word in grey).
- "Got a project, a hackathon squad, or just want to say hi? I usually reply
  within a day."
- A green pulsing dot: "Available for opportunities".
- Email **mehanth362@gmail.com** (opens your mail app) and **Bangalore, India ·
  SWE Intern @ VISA**, side by side when there's room.
- Pill links: LinkedIn, GitHub, Instagram.

**Right (layer 2): message form**
- **Your Name** and **Email Address** side by side (stacked on phones), then
  **Project Details**. Rules: name 2+ characters, a valid email, details 10+
  characters; errors appear under each field.
- **Send Message** (ink button) submits to a Google Apps Script, which records
  the message; "Sending…" while it works; a green "Message sent!" banner for 5
  seconds and a cleared form on success; a red banner if sending fails.

**Desk props** (wide screens only, decorative): a potted plant at the bottom
left, and a black "Mehanth." mug with steam on a stack of books at the bottom
right.

---

## 10. Visual system

Defined in `src/index.css` (tokens) and `src/App.css` (shared pieces).

- **Palette (warm editorial):**
  - paper `#F4F1EA` (every editorial sheet, with a faint generated paper fibre)
  - card `#FFFEFA`
  - ink `#111114`
  - muted `#6F707A`
  - line `#E1DED7`
  - signature amber `#FFB51B`
  - restrained gold `#C9962B`
  - green `#138A4E` for status
- **Where amber appears:** the brand dot, the primary CTA (Download CV), "HI,
  I'M", the selected-district ring in Skill Town, and the cutaway's burning
  edge. Everything else in the interface is neutral. Strong colour comes from
  the 3D worlds.
- **Type:**
  - Syne for display (the name, section titles, scores)
  - Poppins for everything else
  - Caveat, only for the handwritten margin notes
- **Shared pieces:**
  - `.sheet-header`: left-aligned eyebrow, title, lede and actions
  - `.pill-btn`: ink, amber and outlined variants
  - `.section-eyebrow`, small grey uppercase, e.g. "02 · Skills"
  - `Scribble`: margin notes, hidden below 1100 px
- **Shapes:** cream cards with 20–24 px radius, thin borders and soft shadows;
  pill buttons; 1 px lines.
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
  - navigation jumps instead of gliding, and seam props don't parallax
  - layers just fade in, and there's no mouse parallax
  - the 3D name stays still
  - camera swoops are skipped
- Every interaction works from the keyboard: the page scrolls with the normal
  keys, and Escape closes the project overlays. Overlays are proper dialogs
  that take focus and hand it back when they close.
- Body text meets AA contrast. Social and navigation controls have accessible
  labels.

---

## 13. Phones and tablets

- Touch devices are detected by pointer type, so iPads count too. The navbar
  becomes a hamburger menu.
- **Home:** the space cutaway moves to the top-right corner and the hero copy
  sits below it. The name shrinks to fit the width. Extra bottom padding keeps
  the social icons clear of the tour button, and the scroll cue hides.
- **Skill Town:** a compact title at the top with "Drive the car" below it, the
  island in the middle, and the skills card along the bottom (above the tour
  button). Orbiting and driving never swipe you to another section.
- **Work:**
  - The header shrinks to the title and the two buttons.
  - The chase camera pulls back on portrait screens, so the plane's wings and
    the islands stay in view.
  - A large joystick plus FIRE, ↑ and ↓ buttons appear, touch-locked so the
    browser can't steal the drag.
  - The tour button steps aside on Work, so it doesn't sit on the joystick.
- **Awards and Contact** stack into one column and scroll within themselves
  before a swipe changes section.

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
