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
import FPSMovement from "./FPSMovement.jsx";

/** Shows a centred loading spinner with progress % while EXR loads. */
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
        {/* Spinner ring */}
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

function Scene({ config }) {
  const controlsRef = useRef();
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Environment
          files={config.exr}
          {...(config.ground ? { ground: config.ground } : {})}
        />
      </Suspense>
      <FPSMovement controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={30}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export default function WorldScene() {
  const { id } = useParams();
  const navigate = useNavigate();
  const config = WORLDS_CONFIG[id];

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

      <KeyboardControls map={KEY_MAP}>
        <Canvas
          camera={{ position: config.cameraPosition, fov: config.cameraFov }}
          style={{ background: "#111" }}
        >
          <Scene config={config} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
