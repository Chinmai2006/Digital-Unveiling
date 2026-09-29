# GESTURE-CONTROLLED CINEMATIC LOGO UNVEILING SYSTEM
### ACES Website Launch & Inauguration Event

An interactive, gesture-controlled digital inauguration system built with **React, TypeScript, Vite, Tailwind CSS, Framer Motion, MediaPipe Tasks Vision, and Node.js WebSockets**.

Designed for live stage events: a tablet captures the presenter's hand gesture locally using MediaPipe hand tracking, sends real-time commands over local Wi-Fi to a laptop server, and controls a cinematic projector presentation with dynamic audio synthesizers, particle shockwaves, and a grand finale reveal.

---

## 1. SYSTEM ARCHITECTURE

```text
                    PRESENTER / PERSON
                            │
                            ▼
                     📱 TABLET DEVICE
                      Camera Input
                            │
                            ▼
                   MediaPipe Hand Tracker
                 (21 3D Joint Landmarks)
                            │
                            ▼
                 Open-Palm GestureDetector
                (400ms Hold + 1.5s Lockout)
                            │
                    "REVEAL_NEXT"
                            │
                       Local Wi-Fi
               (ws://<LAPTOP-LAN-IP>:3001)
                            │
                            ▼
                     💻 LAPTOP SERVER
              (Authoritative State Machine)
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
   📽️ PROJECTOR DISPLAY           🎛️ OPERATOR CONTROL
        (/projector)                     (/control)
- Fullscreen Cinematic Output    - Manual Fallback & Reset
- Web Audio Synthesizer          - Active State Sync
- Stardust & Finale Shockwaves   - Direct Logo Jumps
```

---

## 2. THE FIVE LOGOS (FIXED SEQUENCE)

1. **ACES** — *Association of Computer Engineering Students*
2. **ACM** — *Association for Computing Machinery*
3. **Technical Club** — *Code, Hardware & Digital Future*
4. **Art Circle Club** — *Creativity, Stage & Digital Art*
5. **Idea Bank Club** — **GRAND FINALE CLIMAX** ("IDEAS START HERE")

---

## 3. QUICK START & RUNNING LOCALLY

### Prerequisites
- Node.js (v18 or higher)
- Both Laptop and Tablet connected to the **SAME Wi-Fi network**.

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Start both WebSocket Server & Vite Client concurrently
npm run dev
```

By default:
- **Client (Laptop / Presentation App)**: `https://localhost:5173`
- **Server (WebSocket / API)**: `http://0.0.0.0:3001` (WebSocket proxied via `wss://0.0.0.0:5173/ws`)

---

## 4. INAUGURATION EVENT SETUP (STEP-BY-STEP FOR HTTPS & CAMERA)

Modern browsers **require HTTPS** (a Secure Context) to grant camera access (`getUserMedia`) when opened from external devices over local Wi-Fi.



### Step 1: Start Application
Run `npm run dev` on the laptop. Vite starts an HTTPS server enabled by `@vitejs/plugin-basic-ssl`.

### Step 2: Open Projector Display (`/projector`)
1. Connect Laptop HDMI output to the venue **Projector**.
2. Open Chrome or Edge on Laptop and navigate to:
   `https://localhost:5173/projector`
3. Accept the local dev certificate prompt if shown (*"Advanced -> Proceed to localhost"*).
4. Click anywhere on screen to enable **Cinematic Audio & Sound Effects**.
5. Press `F11` to enter **Fullscreen Mode**.

### Step 3: Open Tablet/Phone Controller (`/tablet`) Over LAN
1. Connect Tablet/Phone to the **SAME Wi-Fi network** as the Laptop.
2. Open browser (Safari / Chrome) on Tablet/Phone and navigate to:
   `https://<LAPTOP-LAN-IP>:5173/tablet`
   *(Example: `https://192.168.1.7:5173/tablet`)*
3. **Accept Local Certificate Warning**:
   - On Chrome/Safari/Android/iOS: Tap **Advanced** ➔ **Proceed to 192.168.1.7 (unsafe)**.
4. **Allow Camera Permissions**: Tap **Allow** when requested.
5. Position tablet facing the presenter on stage.

### Step 4: Open Operator Control Panel (`/control`)
1. On Laptop or second operator browser tab, navigate to:
   `https://localhost:5173/control`
2. Verify both **TABLET: ONLINE** and **PROJECTOR: ONLINE** indicators are green.

---

## 5. GESTURE DETECTION PIPELINE

1. **Camera Processing**: Tablet processes webcam frames locally at 30+ FPS. No raw video is sent across Wi-Fi.
2. **Landmark Extraction**: MediaPipe extracts 21 3D hand joint coordinates.
3. **Geometric Open-Palm Analysis**:
   - Checks if Index, Middle, Ring, Pinky, and Thumb tips are fully extended away from wrist and MCP joints.
4. **Temporal Stability Buffer (300ms–500ms)**:
   - Holds position for `400ms` before confirming. A radial progress ring displays completion.
5. **Cooldown Lockout (1.5s)**:
   - Prevents accidental double triggers during stage presentation.

---

## 6. IDEA BANK GRAND FINALE EXPERIENCE

When logo index 4 (Idea Bank) is triggered, the system initiates a dedicated multi-stage climax sequence:

1. **0–1.0s (Darkness)**: Screen darkens completely into ambient silence.
2. **1.0–2.2s (Spark)**: A glowing golden light spark emerges in center screen.
3. **2.2–4.2s (Energy Vortex Buildup)**: Particles swirl inward with an accelerating pitch synth riser.
4. **4.2–4.6s (Pause)**: Brief dramatic silence / dark flash frame.
5. **4.6s+ (CINEMATIC BOOM)**:
   - Deep sub-bass drop & white noise burst (`SoundEngine`).
   - Fullscreen radial shockwave explosion (`ParticleCanvas`).
   - Holographic emergence of **Idea Bank** logo with **"IDEAS START HERE"** badge.

---

## 7. MANUAL OVERRIDE & BACKUP (`/control`)

If lighting conditions or camera issues affect hand tracking during the live event:
- The operator can instantly trigger reveals from `/control`:
  - `[ REVEAL NEXT LOGO ]`
  - `[ PREVIOUS LOGO ]`
  - `[ TRIGGER IDEA BANK FINALE ]`
  - `[ RESET ENTIRE SHOW ]`
- The Tablet screen also includes a large **MANUAL TOUCH TRIGGER** button at the bottom.

---

## 8. REPLACING LOGO ASSETS

To replace logo files with official high-res PNG assets, overwrite the files in:
```text
client/public/logos/
├── aces.png
├── acm.png
├── technical-club.png
├── art-circle.png
└── idea-bank.png
```
You can also adjust themes, titles, or taglines in `client/src/data/logos.ts`.

---

## 9. TROUBLESHOOTING

- **Tablet cannot connect to WebSocket**: Ensure tablet and laptop are on the same Wi-Fi network and firewall allows incoming connections on port `3001`.
- **Camera feed is black**: Ensure browser camera permissions are allowed on `/tablet`.
- **No sound on projector**: Click anywhere on the `/projector` screen to bypass browser audio autoplay restrictions.

---

## 10. PROJECT STRUCTURE

```text
gesture-logo-reveal/
├── client/
│   ├── public/logos/          # Logo graphics (ACES, ACM, Tech, Art, Idea Bank)
│   └── src/
│       ├── audio/
│       │   └── soundEngine.ts # Web Audio dynamic synthesizer
│       ├── components/
│       │   ├── CameraView.tsx
│       │   ├── GestureIndicator.tsx
│       │   ├── ParticleCanvas.tsx
│       │   ├── CinematicLogo.tsx
│       │   └── FinaleReveal.tsx
│       ├── data/
│       │   └── logos.ts       # Logo configuration array
│       ├── pages/
│       │   ├── ProjectorDisplay.tsx  # Audience display (/projector)
│       │   ├── TabletController.tsx  # Camera gesture input (/tablet)
│       │   └── ControlPanel.tsx       # Operator dashboard (/control)
│       ├── services/
│       │   └── websocket.ts          # Client WS sync hook
│       └── vision/
│           ├── handTracker.ts        # MediaPipe Tasks Vision wrapper
│           └── gestureDetector.ts    # Geometric Open-Palm algorithm
├── server/
│   ├── index.ts               # Express & HTTP server (port 3001)
│   ├── stateMachine.ts        # Authoritative presentation state machine
│   └── websocket.ts           # WebSocket relay & LAN IP discovery
└── shared/
    └── protocol.ts            # Shared TypeScript data types
```
