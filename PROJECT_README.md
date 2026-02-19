# 🌐 AI Avatar World — Project Reference README

> **Purpose of this file:** This README is a deep technical reference for the AI assistant (and developers) to understand exactly how this project is built, how every piece works, and what our custom version will look like. Read this before writing any code.

---

## 📌 What We Are Building

We are building a **3D interactive AI avatar experience** — a web app where users can enter different **themed 3D worlds**, each with a unique **AI-powered avatar character** they can have a real-time voice conversation with.

### Key Differences from the Original `Friend-Next-Door` Project

| Original Project                                             | Our Project                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| Generic avatar environments (park, clinic, etc.)             | **Custom themed worlds** (basketball court, classroom, kitchen, etc.) |
| Ready Player Me characters (Boy, Girl, Doctor, Man, Grandma) | Our own characters with custom personalities                          |
| Basic route switching                                        | Potentially a world-selection lobby/homepage                          |
| Convai SDK for AI                                            | Convai SDK for AI (same)                                              |
| HDR from project files                                       | HDR files sourced from Poly Haven or custom                           |

---

## 🏗️ Complete Architecture — How Everything Works

### 1. Overall Project Structure

The project will have **two main parts**:

```
my-avatar-project/
├── landing/              ← React app: homepage / world-selection screen
│   └── src/
│       └── components/
│           ├── WorldCard.jsx       ← Card UI for selecting a world
│           └── Navbar.jsx
│
└── avatar-world/         ← React app: the actual 3D world + AI avatar
    ├── public/
    │   └── assets/
    │       ├── avatar_bg/          ← HDR files (one per world/environment)
    │       │   ├── basketball_court.hdr
    │       │   ├── classroom.hdr
    │       │   └── ...
    │       └── 3d_models/          ← GLB files (one per avatar character)
    │           ├── player.glb
    │           ├── coach.glb
    │           └── ...
    └── src/
        ├── constants.js            ← API keys and Convai character IDs
        ├── index.js                ← React Router routes
        ├── App.js                  ← World-selection home
        └── components/
            ├── BasketballWorld.jsx ← Full 3D scene for basketball court world
            ├── ClassroomWorld.jsx  ← Full 3D scene for classroom world
            └── Avatar/
                ├── Player.jsx      ← 3D model loader for player GLB
                └── Coach.jsx       ← 3D model loader for coach GLB
```

---

### 2. The 3D Engine — Three.js + React Three Fiber

**Three.js** is a JavaScript library that renders 3D scenes in the browser using WebGL.

**React Three Fiber (`@react-three/fiber`)** is a React wrapper around Three.js. Instead of calling imperative Three.js methods, you write **JSX components** that represent 3D objects.

**`@react-three/drei`** is a helper library on top of React Three Fiber that provides ready-made components:

- `<Environment>` — background + lighting from an HDR file
- `<OrbitControls>` — mouse/touch camera rotation
- `<Html>` — embed HTML elements inside the 3D scene
- `useGLTF` — hook to load a GLB 3D model
- `useAnimations` — hook to play animations from a GLB file

**The `<Canvas>` component is the root of every 3D scene.** Everything inside `<Canvas>` is rendered in WebGL:

```jsx
import { Canvas } from "@react-three/fiber";

<Canvas shadows camera={{ position: [0, 0, 15], fov: 30 }}>
  {/* All 3D content goes here */}
</Canvas>;
```

- `shadows` — enables shadow casting/receiving
- `camera.position` — `[x, y, z]` where the camera starts (we look at origin `[0,0,0]` by default)
- `camera.fov` — field of view in degrees (30 = narrow/zoomed, 60 = wide)

---

### 3. The Environment / World Background — HDR Files

**This is the most important part to understand for swapping worlds.**

An **HDR file** (High Dynamic Range image) is a **360° panoramic photo/image** that wraps around the entire 3D scene like a sphere. It does two things simultaneously:

1. **Provides the visible background** — what you see behind and around the avatar
2. **Provides realistic lighting** — light from the HDR image bounces off 3D objects (so a sunset HDR makes everything look warm-orange)

In the original project, this single line creates the entire world:

```jsx
<Environment
  files="/assets/avatar_bg/Boy.hdr"
  ground={{ height: 5, radius: 30, scale: 20 }}
/>
```

- `files` — path to the `.hdr` file (relative to the `public/` folder)
- `ground.height` — how high above ground level the scene horizon sits
- `ground.radius` — how wide the ground plane extends
- `ground.scale` — how zoomed/scaled the HDR image appears on the ground

**Where to get HDR files:**

- [Poly Haven](https://polyhaven.com/hdris) — 100% free, CC0 licensed HDR panoramas. Search "basketball", "gym", "court", "stadium", "classroom", etc.
- Download as `.hdr` format (NOT `.exr`)
- Place in `public/assets/avatar_bg/` and reference by filename

**For our basketball court world:**

```jsx
<Environment
  files="/assets/avatar_bg/basketball_court.hdr"
  ground={{ height: 5, radius: 40, scale: 25 }}
/>
```

---

### 4. The Avatar Character — GLB Files

**GLB** (GL Binary) is a 3D model file format. It contains:

- The 3D mesh (the visual shape of the character — body, face, hair, clothes)
- Materials and textures (colors/skin/fabric details)
- A skeleton/rig (a hierarchy of "bones" the mesh is attached to)
- Animations (pre-recorded bone movements: idle, walk, talk, wave, etc.)

**Where to get GLB avatars:**

- [Ready Player Me](https://readyplayer.me) — free avatar creator, export as `.glb`. These are the exact same avatars the original project uses (Boy, Girl, Doctor, Man, Grandma are all Ready Player Me avatars)
- [Mixamo](https://mixamo.com) — add animations to any character. You can upload a Ready Player Me GLB to Mixamo and add animations (idle, talking, waving, etc.), then re-export as GLB
- The original project's GLBs already have idle + talk animations baked in from Mixamo

**Loading a GLB in React Three Fiber:**

```jsx
import { useGLTF, useAnimations } from "@react-three/drei";

export function Model(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(
    "/assets/3d_models/player.glb",
  );
  const { actions } = useAnimations(animations, group);

  // Switch between "idle" and "talk" animation
  useEffect(() => {
    const idleClip = "Armature|mixamo.com|Layer0"; // idle animation name
    const talkClip = "Armature|mixamo.com|Layer0.005"; // talk animation name
    const from = props.animationName === "talk" ? talkClip : idleClip;
    const to = props.animationName === "talk" ? idleClip : talkClip;
    if (actions[from]?.isRunning()) actions[from].fadeOut(0.3);
    actions[to]?.reset().fadeIn(0.3).play();
  }, [props.animationName]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature">
          <primitive object={nodes.Hips} />
          {/* All skinned meshes from the GLB go here */}
          <skinnedMesh
            geometry={nodes.Wolf3D_Body.geometry}
            material={materials.Wolf3D_Body}
            skeleton={nodes.Wolf3D_Body.skeleton}
          />
          {/* ... more skinned meshes */}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/assets/3d_models/player.glb");
```

> **IMPORTANT:** The animation names inside a GLB depend on how Mixamo exported them. The original project uses `'Armature|mixamo.com|Layer0'` for idle and `'Armature|mixamo.com|Layer0.005'` for talking. When using a new GLB, you must inspect it (using [gltf.report](https://gltf.report/) or the Three.js editor) to find the actual animation clip names.

**How to get animation names from a GLB:**

```js
// Temporarily add this to print animation names to the browser console:
console.log(animations.map((a) => a.name));
```

**Generating the `<skinnedMesh>` JSX from a GLB:**

- Use the CLI tool `npx gltfjsx public/assets/3d_models/player.glb`
- This auto-generates the full JSX component with all nodes/materials already wired up
- You replace the boilerplate in `Avatar/Player.jsx` with the output

---

### 5. Placing the Avatar in the World

```jsx
<Model
  position={[0, 0, 3]}
  scale={1.8}
  animationName={isTalking ? "talk" : "idle"}
/>
```

- `position={[x, y, z]}` — where in 3D space the avatar stands. `z=3` moves it slightly forward toward the camera
- `scale={1.8}` — how big the avatar appears (1.0 = original GLB size, 1.8 = 80% bigger)
- `animationName` — passed as a prop to the Model component to switch between idle/talk

---

### 6. AI Voice — Convai SDK

**Convai** ([convai.com](https://convai.com)) is the AI backend that powers the conversation. It handles:

- Speech-to-text (listens to user's microphone)
- LLM response generation (the character's personality/knowledge is configured on Convai's dashboard)
- Text-to-speech (the character's voice)

**Setup:**

1. Create an account at [convai.com](https://convai.com)
2. Create a new Character — give it a name, backstory, personality, and voice
3. Copy the **Character ID** (looks like `abc123xyz...`)
4. Copy your **API Key** from the Convai dashboard

**In the code:**

```js
// src/constants.js
export const SETTINGS = {
  "CONVAI-API-KEY": "your-api-key-here",
  BasketballPlayer: "character-id-here",
  Coach: "character-id-here",
};
```

```jsx
// In your World component
import { ConvaiClient } from "convai-web-sdk";
import { SETTINGS } from "../constants";

const convaiClient = new ConvaiClient({
  apiKey: SETTINGS["CONVAI-API-KEY"],
  characterId: SETTINGS["BasketballPlayer"],
  enableAudio: true,
});
```

**How the voice interaction works:**

```
User presses & holds (mousedown / touchstart)
  → convaiClient.startAudioChunk()       ← starts recording mic
User releases (mouseup / touchend)
  → convaiClient.endAudioChunk()         ← stops recording, sends audio to Convai servers

Convai processes:
  → speech-to-text (what user said)
  → LLM generates response
  → text-to-speech (character's voice)

convaiClient.setResponseCallback() fires with:
  → getUserQuery()      ← the user's transcribed speech text
  → getAudioResponse()  ← the NPC's audio + text response

convaiClient.onAudioPlay()  → setIsTalking(true)   ← avatar switches to "talk" animation
convaiClient.onAudioStop()  → setIsTalking(false)  ← avatar switches back to "idle" animation
```

**Installing Convai SDK:**
The original project installs it as a local file dependency (`"convai-web-sdk": "file:../.."`). For our project, install from npm:

```bash
npm install convai-web-sdk
```

---

### 7. Speech Bubble Text Overlays

```jsx
import { Html } from "@react-three/drei";

{
  /* User's speech — bottom left of avatar */
}
<Html position={[-1.5, -0.75, 3]}>
  {userText && (
    <div
      style={{
        background: "rgba(115,117,109,0.5)",
        borderRadius: "10px",
        padding: "10px",
      }}
    >
      <p style={{ maxHeight: "300px", width: "300px" }}>{userText}</p>
    </div>
  )}
</Html>;

{
  /* NPC's response — top right of avatar */
}
<Html position={[1, 3, 3]}>
  {npcText && (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        borderRadius: "10px",
        padding: "10px",
      }}
    >
      <p style={{ maxHeight: "300px", width: "300px" }}>{npcText}</p>
    </div>
  )}
</Html>;
```

`<Html>` from drei embeds a regular HTML `<div>` at a specific 3D position **inside the Canvas**. The `position` is in 3D world-space coordinates `[x, y, z]`, matching the same coordinate system as `<Model>`.

---

### 8. Camera Controls

```jsx
<OrbitControls
  enableZoom={false}
  minPolarAngle={Math.PI / 3} // ~60° — can't look too high up
  maxPolarAngle={Math.PI / 2.25} // ~80° — can't look underground
/>
```

- `enableZoom={false}` — prevents scroll zoom (keeps avatar framing fixed)
- `minPolarAngle / maxPolarAngle` — restricts vertical rotation so camera stays at a reasonable eye-level angle

---

### 9. Routing Between Worlds

```jsx
// src/index.js
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

<Router>
  <Switch>
    <Route exact path="/" component={App} /> {/* World selector */}
    <Route exact path="/basketball-court" component={BasketballWorld} />
    <Route exact path="/classroom" component={ClassroomWorld} />
    <Route exact path="/kitchen" component={KitchenWorld} />
  </Switch>
</Router>;
```

Each world is a **completely independent route** with its own `<Canvas>`, `<Environment>`, `<Model>`, and `convaiClient` instance.

---

## 📦 npm Dependencies

```json
{
  "@react-three/fiber": "^8.12.0",
  "@react-three/drei": "^9.60.0",
  "three": "^0.151.1",
  "convai-web-sdk": "latest",
  "react-router-dom": "^5.2.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1"
}
```

---

## 🔑 Keys & External Services Required

| Service                  | Purpose                 | Where to get it                                                                            |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------ |
| **Convai API Key**       | AI voice conversations  | [app.convai.com](https://app.convai.com) → Settings → API Key                              |
| **Convai Character IDs** | One per avatar/world    | Create characters in Convai dashboard                                                      |
| **HDR files**            | Environment backgrounds | [polyhaven.com/hdris](https://polyhaven.com/hdris) (free)                                  |
| **GLB files**            | Avatar 3D models        | [readyplayer.me](https://readyplayer.me) + [mixamo.com](https://mixamo.com) for animations |

---

## 🏀 Example: Basketball Court World — Step by Step

Here is the exact recipe to create one world:

### Step 1 — Get the HDR background

- Go to [polyhaven.com/hdris](https://polyhaven.com/hdris)
- Search "basketball" or "sports hall" or "gym"
- Download as `.hdr` (2K resolution is fine)
- Place in `public/assets/avatar_bg/basketball_court.hdr`

### Step 2 — Get the Avatar GLB

- Go to [readyplayer.me](https://readyplayer.me)
- Create an avatar (or use existing)
- Export as `.glb` with animations, or upload to [mixamo.com](https://mixamo.com) to add animations
- Download with animations as `.glb`
- Place in `public/assets/3d_models/player.glb`

### Step 3 — Generate JSX for the GLB model

```bash
npx gltfjsx public/assets/3d_models/player.glb -o src/components/Avatar/Player.jsx
```

This generates the exact `<skinnedMesh>` JSX for that specific GLB file.

### Step 4 — Find animation names

Add temporarily to Player.jsx: `console.log(animations.map(a => a.name))`
Note the idle animation name and the talk animation name.

### Step 5 — Create the Convai character

- Login to [app.convai.com](https://app.convai.com)
- Create character → give it personality (e.g., "You are a basketball player who loves the game...")
- Copy the Character ID

### Step 6 — Add the world component

Create `src/components/BasketballWorld.jsx` following the exact same pattern as `BoyAvatar.jsx` from the original project, but with:

- `files="/assets/avatar_bg/basketball_court.hdr"`
- `import { Model } from "./Avatar/Player"`
- `characterId: SETTINGS['BasketballPlayer']`

### Step 7 — Add the route

In `src/index.js` add: `<Route exact path="/basketball-court" component={BasketballWorld} />`

---

## 🗂️ File Responsibilities — Quick Reference

| File                                 | What it does                                              |
| ------------------------------------ | --------------------------------------------------------- |
| `src/index.js`                       | App entry point + React Router routes                     |
| `src/App.js`                         | World-selection home screen                               |
| `src/constants.js`                   | All API keys and Convai character IDs                     |
| `src/components/BasketballWorld.jsx` | Full 3D scene: Canvas + Environment + Model + Convai + UI |
| `src/components/Avatar/Player.jsx`   | 3D model loader: loads GLB, switches animations           |
| `public/assets/avatar_bg/*.hdr`      | 360° environment panoramas (one per world)                |
| `public/assets/3d_models/*.glb`      | 3D avatar characters with animations                      |

---

## ⚡ Key Technical Rules to Remember

1. **Every avatar/world component follows the same template** — `<Canvas>` → `<Environment>` → `<Model>` → `<Html>` overlays → `<OrbitControls>`. Do not deviate from this structure.

2. **HDR goes in `public/`** — not in `src/`. The path in the `files` prop must start with `/assets/...` (relative to `public/`).

3. **GLB goes in `public/`** — same rule. `useGLTF('/assets/3d_models/player.glb')` — the path starts at `public/`.

4. **Run `npx gltfjsx` on every new GLB** — do not hand-write `<skinnedMesh>` JSX. The auto-generated output is always correct for that specific GLB's node/material names.

5. **Animation names must match exactly** — the string you pass to `actions['...']` must exactly match an animation name in the GLB. Log them to the console first to confirm.

6. **One `convaiClient` per component** — declare it at module level (outside the component function) to avoid re-creating on every render.

7. **`useGLTF.preload()`** at the bottom of every Avatar/\*.jsx file — this pre-fetches the GLB before the component mounts, eliminating the loading flash.

8. **`convai-web-sdk` requires microphone permission** — the browser will prompt the user for mic access on first interaction. This is normal.

9. **The `position` and `scale` props on `<Model>` need manual tuning** — different GLB files have different origin points and default sizes. Start with `position={[0, 0, 3]} scale={1.8}` and adjust visually.

10. **`minPolarAngle` and `maxPolarAngle` are in radians** — `Math.PI / 3` = 60°, `Math.PI / 2` = 90°, `Math.PI / 2.25` ≈ 80°.
