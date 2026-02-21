import { useEffect, useRef } from "react";
import { useAvatar } from "../../hooks/useAvatar.js";

/**
 * Avatar — renders a Ready Player Me avatar with emotion + talking + animation support.
 *
 * @param {Object}    props
 * @param {string}    [props.url]             — GLB path (default: /avatar.glb)
 * @param {string[]}  [props.animationUrls]   — external animation FBX/GLB paths
 * @param {string}    [props.emotion]         — emotion name to display
 * @param {boolean}   [props.talking]         — toggle mouth talking animation
 * @param {string}    [props.animation]       — animation clip name to play
 * @param {Function}  [props.onReady]         — called with full avatar API
 * @param {Array}     [props.position]        — [x, y, z]
 * @param {number}    [props.scale]           — uniform scale
 */
export default function Avatar({
    url,
    animationUrls,
    emotion,
    talking,
    animation,
    onReady,
    position = [0, 0, 0],
    scale = 1,
}) {
    const {
        scene,
        setEmotion,
        currentEmotion,
        startTalking,
        stopTalking,
        isTalking,
        playAnimation,
        stopAnimation,
        actions,
        mixer,
        animationNames,
    } = useAvatar({ url, animationUrls });

    const readyFired = useRef(false);

    // Fire onReady once
    useEffect(() => {
        if (onReady && !readyFired.current) {
            readyFired.current = true;
            onReady({
                setEmotion, currentEmotion,
                startTalking, stopTalking, isTalking,
                playAnimation, stopAnimation,
                actions, mixer, animationNames,
            });
        }
    }, [onReady, setEmotion, currentEmotion, startTalking, stopTalking, isTalking, playAnimation, stopAnimation, actions, mixer, animationNames]);

    // Declarative emotion prop
    useEffect(() => {
        if (emotion) setEmotion(emotion);
    }, [emotion, setEmotion]);

    // Declarative talking prop
    useEffect(() => {
        if (talking) startTalking();
        else stopTalking();
    }, [talking, startTalking, stopTalking]);

    // Declarative animation prop
    useEffect(() => {
        if (animation) playAnimation(animation);
    }, [animation, playAnimation]);

    return (
        <primitive
            object={scene}
            position={position}
            scale={scale}
            dispose={null}
        />
    );
}


