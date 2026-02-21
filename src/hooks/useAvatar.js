import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import { EMOTION_MORPH_MAP } from "../types/emotion.js";

const DEFAULT_URL = "/avatar.glb";
const LERP_SPEED = 5;
const CROSSFADE_DURATION = 0.4;

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

const VISEME_SYLLABLES = [
    { viseme: "viseme_aa", jaw: 0.35, weight: 0.9 },
    { viseme: "viseme_E", jaw: 0.2, weight: 0.8 },
    { viseme: "viseme_I", jaw: 0.15, weight: 0.7 },
    { viseme: "viseme_O", jaw: 0.3, weight: 0.85 },
    { viseme: "viseme_U", jaw: 0.25, weight: 0.7 },
    { viseme: "viseme_CH", jaw: 0.1, weight: 0.6 },
    { viseme: "viseme_FF", jaw: 0.05, weight: 0.5 },
    { viseme: "viseme_PP", jaw: 0.02, weight: 0.7 },
    { viseme: "viseme_SS", jaw: 0.08, weight: 0.55 },
    { viseme: "viseme_TH", jaw: 0.12, weight: 0.5 },
    { viseme: "viseme_nn", jaw: 0.05, weight: 0.4 },
    { viseme: "viseme_RR", jaw: 0.18, weight: 0.6 },
    { viseme: "viseme_DD", jaw: 0.15, weight: 0.55 },
    { viseme: "viseme_kk", jaw: 0.1, weight: 0.5 },
];

const VISEME_REST = { viseme: "viseme_sil", jaw: 0.0, weight: 0.0 };

const ALL_VISEME_NAMES = [
    "viseme_aa", "viseme_E", "viseme_I", "viseme_O", "viseme_U",
    "viseme_CH", "viseme_DD", "viseme_FF", "viseme_kk", "viseme_nn",
    "viseme_PP", "viseme_RR", "viseme_SS", "viseme_TH", "viseme_sil",
];


export function useAvatar({
    url = DEFAULT_URL,
    animationUrls = [],
    lerpSpeed = LERP_SPEED,
    crossfadeDuration = CROSSFADE_DURATION,
} = {}) {
    const gltf = useGLTF(url);
    const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);

    const morphMeshes = useMemo(() => {
        const meshes = [];
        scene.traverse((node) => {
            if (
                node.isSkinnedMesh &&
                node.morphTargetDictionary &&
                node.morphTargetInfluences
            ) {
                meshes.push(node);
            }
        });
        return meshes;
    }, [scene]);

    const emotionRef = useRef("neutral");

    const setEmotion = useCallback((name) => {
        const key = (name || "neutral").toLowerCase();
        if (EMOTION_MORPH_MAP[key] !== undefined) {
            emotionRef.current = key;
        } else {
            console.warn(`[useAvatar] Unknown emotion: "${name}"`);
        }
    }, []);

    const talkingRef = useRef(false);
    const talkStateRef = useRef({
        currentSyllable: VISEME_REST,
        nextSyllable: VISEME_REST,
        progress: 0,
        syllableDuration: 0.12,
        elapsed: 0,
        pauseCounter: 0,
    });

    const startTalking = useCallback(() => {
        talkingRef.current = true;
        const state = talkStateRef.current;
        state.elapsed = 0;
        state.progress = 0;
        state.currentSyllable = VISEME_REST;
        state.nextSyllable = VISEME_SYLLABLES[Math.floor(Math.random() * VISEME_SYLLABLES.length)];
        state.pauseCounter = 0;
    }, []);

    const stopTalking = useCallback(() => {
        talkingRef.current = false;
    }, []);

    const [externalClips, setExternalClips] = useState([]);

    useEffect(() => {
        if (!animationUrls || animationUrls.length === 0) return;
        let cancelled = false;

        const loadAll = async () => {
            const clips = [];
            for (const animUrl of animationUrls) {
                try {
                    const isFbx = animUrl.toLowerCase().endsWith(".fbx");
                    const loader = isFbx ? fbxLoader : gltfLoader;
                    const result = await new Promise((resolve, reject) =>
                        loader.load(animUrl, resolve, undefined, reject)
                    );
                    const anims = result.animations;
                    if (anims) clips.push(...anims);
                } catch (err) {
                    console.warn(`[useAvatar] Could not load animation: ${animUrl}`);
                }
            }
            if (!cancelled) setExternalClips(clips);
        };

        loadAll();
        return () => { cancelled = true; };
    }, [animationUrls]);

    const allClips = useMemo(() => {
        return [...(gltf.animations || []), ...externalClips];
    }, [gltf.animations, externalClips]);

    const { actions, mixer } = useAnimations(allClips, scene);
    const currentAnimRef = useRef(null);

    const playAnimation = useCallback(
        (name, { loop = true, fadeIn = crossfadeDuration } = {}) => {
            const action = actions[name];
            if (!action) {
                console.warn(`[useAvatar] Animation "${name}" not found. Available:`, Object.keys(actions));
                return;
            }
            action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
            if (!loop) action.clampWhenFinished = true;
            if (currentAnimRef.current && currentAnimRef.current !== action) {
                currentAnimRef.current.fadeOut(fadeIn);
            }
            action.reset().fadeIn(fadeIn).play();
            currentAnimRef.current = action;
        },
        [actions, crossfadeDuration]
    );

    const stopAnimation = useCallback(
        (fadeOut = crossfadeDuration) => {
            if (currentAnimRef.current) {
                currentAnimRef.current.fadeOut(fadeOut);
                currentAnimRef.current = null;
            }
        },
        [crossfadeDuration]
    );

    const autoPlayed = useRef(false);
    useEffect(() => {
        if (!autoPlayed.current && actions) {
            const names = Object.keys(actions);
            if (names.length > 0) {
                playAnimation(names[0]);
                autoPlayed.current = true;
            }
        }
    }, [actions, playAnimation]);

    useFrame((_, delta) => {
        const emotionTargets = EMOTION_MORPH_MAP[emotionRef.current] || {};
        const speed = lerpSpeed * delta;
        const visemeTargets = {};
        if (talkingRef.current) {
            const state = talkStateRef.current;
            state.elapsed += delta;

            if (state.elapsed >= state.syllableDuration) {
                state.elapsed = 0;
                state.currentSyllable = state.nextSyllable;
                state.pauseCounter++;

                if (state.pauseCounter > 2 + Math.floor(Math.random() * 4)) {
                    state.nextSyllable = VISEME_REST;
                    state.syllableDuration = 0.06 + Math.random() * 0.08;
                    state.pauseCounter = 0;
                } else {
                    state.nextSyllable = VISEME_SYLLABLES[Math.floor(Math.random() * VISEME_SYLLABLES.length)];
                    state.syllableDuration = 0.08 + Math.random() * 0.1;
                }
            }

            const t = Math.min(state.elapsed / state.syllableDuration, 1);
            const smoothT = t * t * (3 - 2 * t);

            for (const v of ALL_VISEME_NAMES) {
                visemeTargets[v] = 0;
            }

            if (state.currentSyllable.viseme) {
                visemeTargets[state.currentSyllable.viseme] =
                    state.currentSyllable.weight * (1 - smoothT);
            }
            if (state.nextSyllable.viseme) {
                visemeTargets[state.nextSyllable.viseme] =
                    (visemeTargets[state.nextSyllable.viseme] || 0) +
                    state.nextSyllable.weight * smoothT;
            }

            const jawCurrent = state.currentSyllable.jaw * (1 - smoothT);
            const jawNext = state.nextSyllable.jaw * smoothT;
            visemeTargets["jawOpen"] = jawCurrent + jawNext;
        }
        for (const mesh of morphMeshes) {
            const dict = mesh.morphTargetDictionary;
            const influences = mesh.morphTargetInfluences;

            for (const morphName in dict) {
                const idx = dict[morphName];

                let target;
                if (talkingRef.current && visemeTargets[morphName] !== undefined) {
                    target = visemeTargets[morphName];
                } else if (ALL_VISEME_NAMES.includes(morphName) || morphName === "jawOpen") {
                    target = 0;
                } else {
                    target = emotionTargets[morphName] ?? 0;
                }

                influences[idx] += (target - influences[idx]) * Math.min(speed, 1);
            }
        }
    });

    return {
        scene,
        setEmotion,
        get currentEmotion() { return emotionRef.current; },
        startTalking,
        stopTalking,
        get isTalking() { return talkingRef.current; },
        playAnimation,
        stopAnimation,
        actions,
        mixer,
        get animationNames() { return Object.keys(actions || {}); },
    };
}
