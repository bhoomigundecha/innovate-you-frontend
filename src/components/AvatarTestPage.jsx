import { Suspense, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./avatar/index.js";
import { EMOTIONS } from "../types/emotion.js";


const ANIMATION_FILES = [
];

const EMOTION_COLORS = {
    neutral: { bg: "#6b7280", ring: "#9ca3af" },
    happy: { bg: "#f59e0b", ring: "#fbbf24" },
    sad: { bg: "#3b82f6", ring: "#60a5fa" },
    angry: { bg: "#ef4444", ring: "#f87171" },
    surprised: { bg: "#a855f7", ring: "#c084fc" },
    disgusted: { bg: "#22c55e", ring: "#4ade80" },
    fearful: { bg: "#8b5cf6", ring: "#a78bfa" },
    calm: { bg: "#06b6d4", ring: "#22d3ee" },
};

function Loader() {
    return (
        <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#93c5fd" wireframe />
        </mesh>
    );
}

function AvatarScene({ emotion, talking, animation, animationUrls, onAvatarReady }) {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
            <directionalLight position={[-2, 3, -2]} intensity={0.4} />
            <Suspense fallback={<Loader />}>
                <Avatar
                    emotion={emotion}
                    talking={talking}
                    animation={animation}
                    animationUrls={animationUrls}
                    position={[0, -1, 0]}
                    scale={1}
                    onReady={onAvatarReady}
                />
            </Suspense>

            <ContactShadows
                position={[0, -1, 0]}
                opacity={0.4}
                scale={6}
                blur={2.5}
                far={4}
            />

            <OrbitControls
                target={[0, 0.2, 0]}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
                minDistance={1.5}
                maxDistance={5}
                enablePan={false}
            />
        </>
    );
}

const panelStyle = {
    padding: "14px 20px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export default function AvatarTestPage() {
    const [emotion, setEmotion] = useState("neutral");
    const [talking, setTalking] = useState(false);
    const [animation, setAnimation] = useState(null);
    const [animNames, setAnimNames] = useState([]);
    const navigate = useNavigate();
    const apiRef = useRef(null);

    const onAvatarReady = useCallback((api) => {
        apiRef.current = api;
        setAnimNames(api.animationNames || []);
        console.log("[AvatarTestPage] Available animations:", api.animationNames);
    }, []);
    const [loadedAnimUrls] = useState(() => {
        return ANIMATION_FILES;
    });

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                background: "#0f0f13",
                overflow: "hidden",
            }}
        >
            <Canvas
                camera={{ position: [0, 0.5, 2.8], fov: 45 }}
                style={{ width: "100%", height: "100%" }}
            >
                <AvatarScene
                    emotion={emotion}
                    talking={talking}
                    animation={animation}
                    animationUrls={loadedAnimUrls}
                    onAvatarReady={onAvatarReady}
                />
            </Canvas>

            <button
                onClick={() => navigate("/")}
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 20,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    color: "#fff",
                    padding: "8px 18px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                }}
            >
                ← Back
            </button>

            <button
                onClick={() => setTalking((prev) => !prev)}
                style={{
                    position: "absolute",
                    top: 70,
                    left: 20,
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: talking
                        ? "rgba(244,114,182,0.2)"
                        : "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    border: talking
                        ? "1px solid rgba(244,114,182,0.5)"
                        : "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    color: talking ? "#f9a8d4" : "#fff",
                    padding: "8px 18px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                    boxShadow: talking ? "0 0 16px rgba(244,114,182,0.3)" : "none",
                }}
            >
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: talking ? "#f472b6" : "rgba(255,255,255,0.4)",
                        boxShadow: talking ? "0 0 8px #f472b6" : "none",
                        transition: "all 0.2s",
                    }}
                />
                {talking ? "Talking..." : "Start Talking"}
            </button>

            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: EMOTION_COLORS[emotion]?.bg || "#6b7280",
                            boxShadow: `0 0 12px ${EMOTION_COLORS[emotion]?.ring || "#9ca3af"}`,
                        }}
                    />
                    <span
                        style={{
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {emotion}
                    </span>
                </div>

                {animation && (
                    <>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>·</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: "#f472b6",
                                    boxShadow: "0 0 8px #f472b6",
                                    animation: "pulse 1.5s infinite",
                                }}
                            />
                            <span
                                style={{
                                    color: "#f9a8d4",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {animation}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    ...panelStyle,
                    padding: "12px 14px",
                }}
            >
                <span
                    style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    Animations
                </span>
                {animNames.length === 0 && (
                    <span
                        style={{
                            color: "rgba(255,255,255,0.25)",
                            fontSize: 11,
                            fontStyle: "italic",
                            maxWidth: 120,
                            lineHeight: 1.4,
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        No animation files found. Add .glb files to public/animations/
                    </span>
                )}
                {animNames.map((name) => {
                    const active = animation === name;
                    return (
                        <button
                            key={name}
                            onClick={() => {
                                setAnimation(name);
                                if (apiRef.current) apiRef.current.playAnimation(name);
                            }}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 10,
                                border: active
                                    ? "2px solid #f472b6"
                                    : "2px solid transparent",
                                background: active
                                    ? "rgba(244,114,182,0.15)"
                                    : "rgba(255,255,255,0.05)",
                                color: active ? "#f9a8d4" : "rgba(255,255,255,0.6)",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
                                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                                boxShadow: active ? "0 0 12px rgba(244,114,182,0.3)" : "none",
                                textAlign: "left",
                            }}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 20,
                    display: "flex",
                    gap: 10,
                    ...panelStyle,
                }}
            >
                {EMOTIONS.map((e) => {
                    const active = emotion === e;
                    const colors = EMOTION_COLORS[e] || EMOTION_COLORS.neutral;
                    return (
                        <button
                            key={e}
                            onClick={() => setEmotion(e)}
                            style={{
                                position: "relative",
                                padding: "8px 16px",
                                borderRadius: 12,
                                border: active
                                    ? `2px solid ${colors.ring}`
                                    : "2px solid transparent",
                                background: active
                                    ? `${colors.bg}30`
                                    : "rgba(255,255,255,0.05)",
                                color: active ? colors.ring : "rgba(255,255,255,0.6)",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                                textTransform: "capitalize",
                                fontFamily: "'Inter', sans-serif",
                                letterSpacing: "0.03em",
                                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                                boxShadow: active
                                    ? `0 0 16px ${colors.bg}40`
                                    : "none",
                            }}
                        >
                            {e}
                        </button>
                    );
                })}
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 20,
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                Emotions (bottom) + Animations (left) blend together · Drag to orbit · Scroll to zoom
            </div>
        </div>
    );
}
