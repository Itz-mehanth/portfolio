# mehanth.site — Site Guide

What is on every screen of the portfolio, how it moves, and which file builds it.
**Keep this file in sync with the code:** every change to a section, its
content, its controls or the motion system should update the matching part of
this guide in the same commit.

_Last updated: 2026-10-30 (Awards and Contact as one sunlit room: 3D greenery strip, window corner, light on the paper)._

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
| 04 | Awards | `/certificates` | Awards | Small 3D props (wide screens) |
| 05 | Contact | `/contact` | Contact | Small 3D props (wide screens) |

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
| Home → Skills | Home's paper **tears open** onto Skill Town's sky; a second, darker sheet peeks out under the tear; rocks, clouds and paper scraps cross it |
| Skills → Work | A **strip of paper torn on both edges** lies across the boundary; clouds, rocks and a scrap hang off it |
| Work → Awards | Awards' paper **rises over** the flight world with a torn, stacked top edge; rocks, a paper airplane, a gold coin and a scrap cross it |
| Awards → Contact | Same paper, no edge at all. A **3D greenery strip** grows in from the left edge across both: sprays of glossy, split monstera leaves on stems, their shadows falling on the paper, ending in a potted plant and a rock pile at the bottom of Contact (wide screens) |

Each prop has its own scroll speed, so as you scroll they drift at different
rates against the page: that parallax is what makes the seams feel like depth.
The torn sheets fade out on their flat side, so only the tear reads.

**How a tear is drawn** (SVG):
- **The torn line** layers broad wander, medium lumps, small bites, fine
  jaggies and the odd sharp nick, like paper pulled apart by hand.
- **The rim:** a bright white fibrous band, of varying width, follows the line.
  It's roughened into hair-like fibres by a turbulence displacement filter.
- **The face** carries paper grain. The paper darkens slightly just inside the
  tear, where it lifts, and a soft shadow falls beneath it.
- **Real pixel size:** tears are drawn at real pixel size on a 2400px-wide
  sheet and cropped to the screen, never stretched. The fibres look the same on
  a phone and a monitor.

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

Files: `src/Skills.jsx` (selection state, skills data, left panel, car, drive
mode) and the world in `src/skilltown/`:
- `layout.js`: every position in the world (island outline, mounds, roads,
  districts, buildings, trees, turbines, signs, waterfalls, docks), as data
- `Terrain.jsx`: island cliffs, grass top, mounds, sky, ocean, waterfalls,
  docks, boat, sea rocks, clouds
- `Town.jsx`: roads and plaza, buildings, trees, bushes, flowers, wind
  turbines, teal tanks, district signs, selection halo
- `index.jsx`: camera rig, lighting, assembly

**WebGL**, all procedural; the only model is the car (`public/models/car.glb`).

### Layout
- A bright, miniature floating-island town fills the section, seen from an
  elevated three-quarter angle. On wide screens the view is shifted so the
  island sits right of the text.
- Left column, on a soft sky haze: **"02 · Skills"**, **"Skill Town"** on one
  line, "Explore the different areas I work with. Click any house or sign to
  see the skills in that district.", then the selected district as a dark pill
  with an amber dot, and its skills as white chips.
- A handwritten note, "Different skills, same destination", sits in the margin
  (wide screens only).
- **"Drive the car"** (ink pill) sits at the lower right.

### The world
- **Island:** one broad island with an irregular, lobed outline. A grass top
  sits above faceted cliffs in visible layers (grassy lip, sandy ochre band,
  then terracotta and red-brown rock) that step in and out, so the island reads
  as a raised diorama above the sea. Gentle grassy mounds roll up toward the
  back.
- **Roads:** a pale stone road loops through the town, a central avenue crosses
  it through a **plaza with a fountain**, and two spurs lead to the east dock
  and a west lookout. Every road has a sandy shoulder.
- **Nine districts:** Languages, Web, Mobile, Backend, Database, AR/VR, UI/UX,
  Tools and AI/ML. Each district has exactly **two buildings** beside its stop
  on the loop: one main building and one cottage. There are no filler houses;
  the rest of the island is trees and gardens.
- **Main buildings** (one of three kinds, in turn):
  - **Domed hall:** a portico of four columns on three steps under a pediment,
    tall windows all round, and a parapet. On the roof, a drum with pilasters
    and windows carries a dome with a lantern and a gold finial.
  - **Clock-tower house:** a two-storey gabled house with a square tower at the
    front corner. The tower has clock faces on three sides (dial, hour marks
    and hands) under a pyramid roof with a gold finial.
  - **Manor:** two storeys under a hipped roof, with two chimneys. A porch with
    two columns and a balcony rail shelters the door.
- **Cottages:** one storey with a gabled or hipped roof, a chimney, and flower
  boxes under the front windows.
- **Detail on every building** (`src/skilltown/Buildings.jsx`):
  - a stone plinth, corner pilasters, a cornice and storey bands
  - framed windows with mullions, lintels, sills and coloured shutters
  - panelled doors with a brass knob, a stone step and a little canopy
  - thick roof slabs with tile courses, a ridge cap, bargeboards, filled gable
    ends with a round vent, and brick chimneys
  - stepping stones from the door to the street; every building faces its
    street
- **Cost:** each district's buildings are merged into one solid mesh and one
  glass mesh, so all that detail costs two draw calls per district.
- **Greenery:** about 130 rounded multi-lobe trees, about 70 bushes and flower
  patches, never on roads or buildings.
- **Wind turbines:** six slender white turbines on the rear mounds, turning
  slowly.
- **Teal tanks:** small accents beside some landmarks.
- **Water:**
  - a turquoise-to-deep-blue ocean with slow, broad light swells and breathing
    foam around the cliffs
  - four waterfalls, each fed by a creek across the grass, with foam at the foot
  - two wooden docks, a bobbing sailboat and rocks in the sea
- **Sky:** a gradient sky dome, with soft clouds framing the island at the
  sides and back.
- **Light:** warm sun from the upper left with soft shadows, plus a sky/ground
  fill light. Everything is matte: no bloom, no outlines.

### District signs
Dark charcoal rounded rectangles with white uppercase labels and a soft drop
shadow. They float above each district and always face the camera, and they're
nudged apart so they never overlap. The selected one grows, bobs gently and
gets an amber border and amber text, and an amber halo rings its buildings on
the ground. On portrait screens the signs scale up to stay readable.

### Interaction
- **Click a sign or any house:** that district is selected, the left panel
  updates at once, and the car drives there along the road (the shorter way
  round the loop, easing in and out).
- **Camera:** a fixed composition, not a free orbit. It eases in on arrival and
  drifts a few degrees with the pointer. The wheel scrolls the page; touch
  swipes scroll the page; taps still select.
- **Narrow screens:** the camera backs off until the whole island fits the
  width.
- **Reduced motion:** no camera ease or parallax, no turbine, ocean, waterfall,
  cloud, boat or sign animation.

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
- **"Drive the car"** hands you the car where it stands.
- **Desktop:** W/↑ accelerates; S/↓ brakes, then reverses; A/D or ←/→ steer;
  Space is the handbrake; R resets. A key guide sits at the bottom.
- **Touch screens:** an analog stick (push gently to creep, fully to race) and
  Brake and Reset buttons sit at the lower right.
- **Feel:**
  - The car accelerates, coasts and brakes instead of starting and stopping
    instantly.
  - It steers like a real car: it turns only while rolling, and steers less at
    speed.
  - It follows the hills, pitching with the slope and leaning out of turns.
- **Collisions:** the car bumps into buildings, turbines, tanks and the
  fountain. A head-on hit stops it; a glancing one slides along.
- **The edge:** drive off the island and the car sails off, drops into the sea,
  and respawns at the Languages district.
- **Camera:**
  - The chase camera swings in behind the car with a little lag, pulls back
    as you speed up, and looks just ahead of the bonnet.
  - It switches to a wider lens than the overview.
  - It stops short of any building between it and the car, so it never ends
    up inside a wall.
- While driving, the Skill Town title, the skills panel and the sky haze fade
  away so the street is clear.
- Press **"Exit drive mode"** to return to the overview camera (and its lens).

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

**Desk props** (wide screens only): **real 3D objects** at the top right.
- A wooden-framed certificate behind glass leans on its stand.
- In front of it: a gold medal on red and blue ribbons, swaying gently, and a
  gold trophy on a dark wooden base.
- Three gold coins lie around them.
- The gold reflects a generated studio light, and soft shadows fall on the
  paper. The group turns a few degrees toward the mouse.
- Files: `src/DeskProps.jsx` (loader), `src/Desk3D.jsx` (the scenes).

**Light and greenery:**
- Warm sun glows behind the certificate at the top right, with soft shafts
  slanting in from the top left and gently darker side walls. This is CSS,
  behind the content.
- Down the left edge, the 3D greenery strip (glossy split leaves casting
  shadows on the paper) grows on into Contact, so the two sections read as one
  sunlit room.

---

## 9. 05 · Contact

Component: `ContactSection` in `src/App.jsx` · styles: `src/Contact.css` ·
props: `src/DeskProps.jsx` → `src/Desk3D.jsx` (small 3D scenes, wide screens only).

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

**The room** (wide screens only, decorative, **real 3D**):
- **Bottom right, a sunlit window corner** (behind the form):
  - a painted wooden window with a mullion cross and a sheer pleated curtain
  - glowing warm sky and garden greens through the glass
  - a windowsill carrying a small potted plant, and a stack of three
    cloth-bound books (page edges, gold spine bands)
  - on the books, a glazed black mug with an amber-dot "Mehanth." label,
    coffee inside and steam curling up
  - the sun shines in through the window: the mug and books cast shadows
    forward along the sill, shafts of light fall from the window, and dust
    motes drift in them
- **Bottom left:** the end of the greenery strip that runs down from Awards
  (see Seams): a terracotta pot of glossy split leaves beside a pile of rocks.
- **Light on the paper** (CSS, behind the content):
  - a warm glow from the window at the bottom right
  - a softer glow at the top left, soft shafts slanting in
  - a blurred, window-shaped patch of sunlight between the details and the
    form
  - gently darker side walls

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
  the animation library and the app). No 3D library loads for Home.
- **Awards and Contact 3D scenes** (desk props, greenery strip, window corner) download (a few KB, plus the shared 3D
  library) only on screens 1000px or wider, once the section is within about
  800px. They render only while on screen; with reduced motion they render once
  and stay still. Phones never load them.
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
- **Skill Town:**
  - A compact title sits at the top with "Drive the car" below it, and the
    district pill and skill chips along the bottom (above the tour button).
  - The camera rises higher and backs off so the whole island fits the width.
    District signs scale up so they stay readable.
  - Taps select districts; swipes always scroll the page.
  - In drive mode an analog stick, with Brake and Reset buttons, sits at the
    lower right.
- **Awards and Contact:** the 3D desk props, the greenery strip and the window
  corner are skipped below 1000px wide (they never download on phones); the
  warm light on the paper stays.
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
| Skills | `src/Skills.jsx`, `src/skilltown/` (`layout.js`, `Terrain.jsx`, `Town.jsx`, `Buildings.jsx`, `index.jsx`), `src/utils/models/Car.jsx` |
| Work | `src/ProjectsStage.jsx`, `src/Projects.jsx`, `src/Airplane.jsx`, `src/Astroid.jsx` (balloons), `src/Blaster.jsx`, `src/CoinField.jsx`, `src/Coin.jsx`, `src/CockpitControls.jsx`, `src/utils/useKeyboard.jsx` |
| Project pages | `src/ProjectPages.jsx`, `src/ProjectPages.css`, `src/data/projects.js` |
| Awards | `src/Certificates.jsx`, `src/Awards.css`, `src/DeskProps.jsx`, `src/Desk3D.jsx` |
| Contact | `ContactSection` in `src/App.jsx`, `src/Contact.css`, `src/DeskProps.jsx`, `src/Desk3D.jsx` |
| Shared overlays | `src/TourGuide.jsx`, `src/DevicePreview.jsx` |
| Loading | `src/preloadAssets.js`, `vite.config.js` (chunking) |
| Models | `public/models/*.glb` (Skills now uses only `car.glb`) |

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
