// This gets rendered when we navigate to /world/:id
// Reads the :id from url via useParams()
// Looks up WORLDS_CONFIG for that id
// Renders the 3D scene using that config

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  KeyboardControls,
  useProgress,
  Html,
} from "@react-three/drei";
import { useParams, useNavigate } from "react-router-dom";
import { WORLDS_CONFIG } from "../../constant.js";
import { useVoiceChat } from "../../hooks/useVoiceChat.js";
import FPSMovement from "./FPSMovement.jsx";
import Avatar from "../avatar/Avatar.jsx";
import { CHARACTERS } from "../Characters.jsx";

/** Shows a centred loading spinner with progress % while assets load. */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            border: "4px solid rgba(255,255,255,0.2)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, opacity: 0.75 }}>
          {Math.round(progress)}% loaded
        </span>
      </div>
    </Html>
  );
}

const KEY_MAP = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

/**
 * AVATAR_Z   — how far in front the avatar stands (negative = in front of camera).
 * AVATAR_Y   — feet y-position (0 = ground level).
 * TARGET_Y   — where OrbitControls looks (avatar mid-body, ~1 m up).
 * CAM_Y      — camera height (roughly viewer eye level).
 */
const AVATAR_Z = -2.5;
const AVATAR_Y = 0;
const TARGET_Y = 1.0; // avatar's torso / center-of-body
const CAM_Y = 1.0; // viewer eye height

function Scene({ config }) {
  const controlsRef = useRef();

  return (
    <>
      {/* Environment / skybox — wrapped in its own Suspense with loading UI */}
      <Suspense fallback={<Loader />}>
        <Environment
          files={config.exr}
          {...(config.ground ? { ground: config.ground } : {})}
        />
      </Suspense>

      {/* Ready Player Me avatar — stands 2.5 m in front, feet on ground */}
      {config.avatarUrl && (
        <Suspense fallback={null}>
          <Avatar
            url={config.avatarUrl}
            position={[0, AVATAR_Y, AVATAR_Z]}
            scale={1}
          />
        </Suspense>
      )}

      <FPSMovement controlsRef={controlsRef} />

      {/*
        OrbitControls:
          - target = avatar's mid-body so the camera orbits around the avatar
          - minPolarAngle / maxPolarAngle keep the view roughly horizontal
      */}
      <OrbitControls
        ref={controlsRef}
        target={[0, TARGET_Y, AVATAR_Z]}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.65}
      />
    </>
  );
}

export default function WorldScene() {
  const { id } = useParams();
  const navigate = useNavigate();
  const config = WORLDS_CONFIG[id];

  const character = CHARACTERS.find(c => c.glb === config?.avatarUrl);
  const voiceIdForChat = character ? character.voice : "Anushka";

  // Voice chat — auto-starts mic + WS on mount
  const { status, isSpeaking, stop, start } = useVoiceChat({
    voiceId: voiceIdForChat,
    id: 1,
    wsUrl: import.meta.env.VITE_WS_BACKEND_URL,
  });

  if (!config) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#111",
          color: "#fff",
          fontSize: 20,
        }}
      >
        World not found.{" "}
        <button
          onClick={() => navigate("/")}
          style={{
            marginLeft: 16,
            textDecoration: "underline",
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Go home
        </button>
      </div>
    );
  }

  /*
    Camera setup for the "full-body video call" feel:
      position  — viewer stands at eye height (CAM_Y), same Z as camera origin
      fov       — 50° gives a tighter frame that fills the avatar nicely
      The camera looks toward [0, TARGET_Y, AVATAR_Z] (avatar torso) by default
      because that's what OrbitControls targets on mount.
  */
  const cameraConfig = {
    position: [0, CAM_Y, 0],
    fov: config.cameraFov ?? 50,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          zIndex: 10,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 10,
          color: "#fff",
          padding: "7px 16px",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      {/* End Conversation button — top right */}
      <button
        onClick={() => {
          if (status === "streaming") stop();
          navigate("/dashboard");
        }}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 10,
          background: "rgba(239,68,68,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 10,
          color: "#fff",
          padding: "7px 16px",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        End Conversation
      </button>

      {/* Voice status indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          right: 18,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10,
            color: "#fff",
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {isSpeaking ? "🗣 Recording..." : `🎙 ${status === "streaming" ? "Hold Space to talk" : status}`}
        </span>
        <button
          onClick={status === "streaming" ? stop : start}
          style={{
            background: status === "streaming"
              ? "rgba(239,68,68,0.7)"
              : "rgba(34,197,94,0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            color: "#fff",
            padding: "7px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {status === "streaming" ? "⏹ Stop" : "▶ Start"}
        </button>
      </div>

      <KeyboardControls map={KEY_MAP}>
        <Canvas camera={cameraConfig} style={{ background: "#0a0a0a" }}>
          <Scene config={config} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
