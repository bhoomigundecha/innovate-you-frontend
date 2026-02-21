import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

const SPEED = 6;
const _front = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

// controlsRef is passed in so we can move the OrbitControls target WITH the camera
export default function FPSMovement({ controlsRef }) {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();

  useFrame((_, delta) => {
    const { forward, backward, left, right } = get();
    if (!forward && !backward && !left && !right) return;

    // Horizontal look direction from camera
    camera.getWorldDirection(_front);
    _front.y = 0;
    _front.normalize();
    _right.crossVectors(_front, camera.up).normalize();

    _move.set(0, 0, 0);
    if (forward) _move.addScaledVector(_front, SPEED * delta);
    if (backward) _move.addScaledVector(_front, -SPEED * delta);
    if (right) _move.addScaledVector(_right, SPEED * delta);
    if (left) _move.addScaledVector(_right, -SPEED * delta);

    camera.position.add(_move);

    // Move orbit target with camera so look-drag still works naturally
    if (controlsRef?.current) {
      controlsRef.current.target.add(_move);
    }
  });

  return null;
}
