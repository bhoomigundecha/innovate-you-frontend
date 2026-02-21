export const EMOTIONS = [
    "neutral",
    "happy",
    "sad",
    "angry",
    "surprised",
    "disgusted",
    "fearful",
    "calm",
];

export const EMOTION_MORPH_MAP = {
    neutral: {},

    happy: {
        mouthSmileLeft: 0.8,
        mouthSmileRight: 0.8,
        cheekSquintLeft: 0.5,
        cheekSquintRight: 0.5,
        eyeSquintLeft: 0.3,
        eyeSquintRight: 0.3,
        browInnerUp: 0.15,
    },

    sad: {
        mouthFrownLeft: 0.7,
        mouthFrownRight: 0.7,
        browDownLeft: 0.4,
        browDownRight: 0.4,
        browInnerUp: 0.6,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        mouthPucker: 0.15,
    },

    angry: {
        browDownLeft: 0.8,
        browDownRight: 0.8,
        eyeSquintLeft: 0.5,
        eyeSquintRight: 0.5,
        jawForward: 0.3,
        mouthFrownLeft: 0.5,
        mouthFrownRight: 0.5,
        noseSneerLeft: 0.6,
        noseSneerRight: 0.6,
    },

    surprised: {
        browInnerUp: 0.9,
        browOuterUpLeft: 0.8,
        browOuterUpRight: 0.8,
        eyeWideLeft: 0.85,
        eyeWideRight: 0.85,
        jawOpen: 0.5,
        mouthFunnel: 0.4,
    },

    disgusted: {
        noseSneerLeft: 0.8,
        noseSneerRight: 0.8,
        mouthUpperUpLeft: 0.5,
        mouthUpperUpRight: 0.5,
        browDownLeft: 0.4,
        browDownRight: 0.4,
        mouthFrownLeft: 0.3,
        mouthFrownRight: 0.3,
        cheekSquintLeft: 0.3,
        cheekSquintRight: 0.3,
    },

    fearful: {
        browInnerUp: 0.8,
        browOuterUpLeft: 0.5,
        browOuterUpRight: 0.5,
        eyeWideLeft: 0.7,
        eyeWideRight: 0.7,
        mouthStretchLeft: 0.4,
        mouthStretchRight: 0.4,
        jawOpen: 0.2,
    },

    calm: {
        mouthSmileLeft: 0.2,
        mouthSmileRight: 0.2,
        eyeBlinkLeft: 0.1,
        eyeBlinkRight: 0.1,
        browInnerUp: 0.05,
    },
};
