# 🪔 DIWALI BLAST 2026
### Ultimate Interactive Fireworks & Diwali Celebration Website

A spectacular, production-quality, interactive Diwali celebration website crafted with **HTML5**, **CSS3**, **Vanilla JavaScript (ES6+)**, **HTML5 Canvas API**, and procedural **Web Audio API**.

---

## ✨ Features & Highlights

### 1. 🌌 Cinematic Midnight Celebration Theme
- **Atmospheric Palette**: Deep obsidian midnight purple and cosmic gradient with shimmering starfield overlay.
- **Golden Metallic Typography**: Glowing gold typography (`Cinzel Decorative`, `Montserrat`, `Playfair Display`) with shimmer animations.
- **Traditional Ornaments**:
  - Handcrafted SVG **Glowing Diyas (Oil Lamps)** with realistic multi-frequency flame flickering, wick, blue core, and warm radial illumination.
  - Hanging **Akash Kandil (Festive Lanterns)** swaying gently in the midnight breeze.
  - Interactive Diyas: click any diya to relight it with golden sparklers and ring traditional brass temple chimes.

### 2. 🎆 Custom Canvas Fireworks Engine (`js/fireworks.js` & `js/particles.js`)
- **Physics Engine**: Velocity, acceleration, realistic gravity, air resistance (drag), alpha decay, and life cycles.
- **Particle Object Pooling**: Reusable particle pools (`ParticlePool`) guaranteeing 60+ FPS without garbage collection stalls.
- **Motion Blur & Bloom**: Additive blending (`ctx.globalCompositeOperation = 'lighter'`) and translucent trail clears for silky, luminous spark trails.
- **Firework Archetypes**:
  1. **🚀 Rocket Launcher**: Launches upward with burning spark trails and apex deceleration before detonating.
  2. **💥 Bomb Blast**: Cartoon-style Diwali Lakshmi/Sutli bomb with burning fuse cord, live sparkler sparks, screen flash overlay, expanding radial shockwave ring, and screen vibration shake.
  3. **🎆 Mega Fireworks**: Chrysanthemum shell-of-shells clusters with trailing glitter sparks and dragon egg crackles.
  4. **🔥 Anar (Flowerpot) Fountain**: Conical ground fountain shooting high-intensity vertical golden and multi-colored parabolic cascades for 6+ seconds.
  5. **✨ Sparkler (Phuljhadi)**: Sizzling interactive sparkler mode with erratic starburst sparks following mouse cursor and touch drags.
  6. **🌈 Multi-Rocket Show**: Staggered fan barrage of 14 rockets across the sky with synchronized audio.
  7. **🎇 Grand Finale**: Orchestrated 6-wave cinematic spectacle featuring twin ground Anar fountains, multi-rocket batteries, golden Kamuro weeping willow cascades, bomb blasts, and celebratory 3D typography.

### 3. 🔊 Procedural Web Audio API Synthesizer (`js/sound.js`)
- **100% Code-Synthesized**: Zero external audio files, zero 404s, zero lag.
- **Dynamic Stereo Panning**: Rocket sounds pan left/right based on launch X coordinates.
- **Sub-bass Booms**: Punchy, distorted 25Hz - 120Hz sine sweeps for authentic explosion rumble.
- **Fuse Sizzle & Sparkler Crackles**: High-pass filtered noise bursts and randomized crackle sequences.
- **Ambient Festive Music**: Meditative Indian pentatonic drone (Sa-Pa-Dha) accompanied by soft celestial crystal chimes.
- **Mute / Unmute State**: Disabled initially to adhere to browser audio autoplay policies; easily toggled on/off.

### 4. 💌 Personalized Wishes & WhatsApp Sharing (`js/interactions.js`)
- **Custom Name Personalization**: Enter any name in the hero section or wishes card (e.g., "Gaurav", "Family & Friends").
- **Deep-Link Greeting**: Supports URL query parameters (`?name=YourName`) so recipients open a personalized fireworks show dedicated to them.
- **One-Click WhatsApp Sharing**: Generates clean, properly encoded WhatsApp share messages with interactive links.
- **One-Click Copy**: Copies festive greeting to clipboard with instant toast confirmation.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| `1` or `Space` | 🚀 Launch Rocket |
| `2` | 💥 Bomb Blast |
| `3` | 🎆 Mega Fireworks |
| `4` | 🔥 Anar Fountain |
| `5` | ✨ Toggle Sparkler Mode |
| `6` | 🌈 Multi-Rocket Show |
| `7` | 🎇 Grand Finale |
| `M` | 🔊 Toggle Sound (Mute/Unmute) |
| `A` | 🔄 Toggle Auto Fireworks |
| `C` | 🧹 Clear Sky Sparks |
| `R` | 🔁 Replay Hero Intro |
| `W` | 💌 Open Wishes & WhatsApp Modal |
| `Escape` | ❌ Close Open Modals / Exit Sparkler Mode |

---

## 📁 Project Structure

```
diwali-blast-2026/
│
├── index.html                  # Semantic HTML5 markup, SVGs, Modals & UI Dock
├── css/
│   └── style.css               # Glassmorphism, golden typography, diya animations
├── js/
│   ├── main.js                 # App entry point, hero onboarding & initialization
│   ├── fireworks.js            # HTML5 Canvas fireworks physics & burst archetypes
│   ├── particles.js            # High-performance Particle & ParticlePool classes
│   ├── sound.js                # Procedural Web Audio API sound synthesizer
│   └── interactions.js         # Controls, touch/mouse sparkler, wishes & WhatsApp
│
├── assets/
│   ├── images/                 # Image assets (all SVGs are pure inline vector)
│   └── sounds/                 # Sound assets (procedurally synthesized via Web Audio)
│
└── README.md                   # Documentation & guide
```

---

## 🚀 Running the Project

Because the project uses standard ES6 modules (`import` / `export`), open it using any local development server:

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

May your Diwali 2026 be illuminated with boundless joy, prosperity, and light! 🪔✨

