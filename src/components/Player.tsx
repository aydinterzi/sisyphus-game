import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
  useRapier,
} from "@react-three/rapier";
import { useRef, useState } from "react";
import * as THREE from "three";

type Controls =
  | "forward"
  | "backward"
  | "leftward"
  | "rightward"
  | "jump"
  | "dash";

// Configurable constants for easier tuning
const MOVE_SPEED = 6; // Base movement speed
const AIR_CONTROL = 0.3; // Multiplier for air control
const JUMP_FORCE = 7;
const DASH_FORCE = 15;
const DASH_COOLDOWN = 1000; // ms
const CAMERA_OFFSET = new THREE.Vector3(0, 4, 10);
const CAMERA_LERP_GROUND = 0.1;
const CAMERA_LERP_AIR = 0.05;
const ROTATION_LERP = 0.15;

export default function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerModelRef = useRef<THREE.Group>(null);
  const isOnGroundRef = useRef(false);
  const [canDash, setCanDash] = useState(true);
  const lastJumpTime = useRef(0);

  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3());
  const { rapier, world } = useRapier();

  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const targetRotation = useRef(0);

  const [, get] = useKeyboardControls<Controls>();

  // More accurate ground detection with raycasting
  const checkIfOnGround = () => {
    if (!playerRef.current) return false;

    const playerPosition = playerRef.current.translation();
    const rayOrigin = {
      x: playerPosition.x,
      y: playerPosition.y,
      z: playerPosition.z,
    };
    const rayDirection = { x: 0, y: -1, z: 0 };

    const ray = new rapier.Ray(rayOrigin, rayDirection);
    const hit = world.castRay(ray, 1.1, true); // 1.1 = player height + small threshold

    return hit !== null;
  };

  useFrame((state) => {
    if (!playerRef.current || !playerModelRef.current) return;

    // Update ground check
    isOnGroundRef.current = checkIfOnGround();

    const { forward, backward, leftward, rightward, jump, dash } = get();

    // Calculate movement direction
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(leftward) - Number(rightward), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED)
      .applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

    // Get current velocity
    const velocity = playerRef.current.linvel();

    // Apply speed based on ground contact
    const movementMultiplier = isOnGroundRef.current ? 1 : AIR_CONTROL;

    // Handle jumping with a slight delay to prevent double jumps
    const now = state.clock.getElapsedTime();
    if (jump && isOnGroundRef.current && now - lastJumpTime.current > 0.2) {
      playerRef.current.setLinvel(
        {
          x: velocity.x,
          y: JUMP_FORCE,
          z: velocity.z,
        },
        true
      );
      lastJumpTime.current = now;
    }

    // Handle dashing
    if (dash && canDash && direction.length() > 0.1) {
      const dashDir = direction.clone().normalize().multiplyScalar(DASH_FORCE);
      playerRef.current.setLinvel(
        {
          x: dashDir.x,
          y: 0,
          z: dashDir.z,
        },
        true
      );

      // Dash cooldown
      setCanDash(false);
      setTimeout(() => setCanDash(true), DASH_COOLDOWN);
    }

    // Set velocity based on inputs and ground state
    playerRef.current.setLinvel(
      {
        x: direction.x * movementMultiplier,
        y: velocity.y,
        z: direction.z * movementMultiplier,
      },
      true
    );

    // Character rotation to face movement direction
    if (direction.length() > 0.1) {
      targetRotation.current = Math.atan2(direction.x, direction.z);
    }

    // Smoothly rotate model
    playerModelRef.current.rotation.y = THREE.MathUtils.lerp(
      playerModelRef.current.rotation.y,
      targetRotation.current,
      ROTATION_LERP
    );

    // Camera follow with lerp based on ground state
    const playerPosition = playerRef.current.translation();
    const lerpFactor = isOnGroundRef.current
      ? CAMERA_LERP_GROUND
      : CAMERA_LERP_AIR;

    cameraTarget.current.set(
      playerPosition.x,
      playerPosition.y + CAMERA_OFFSET.y,
      playerPosition.z + CAMERA_OFFSET.z
    );

    camera.position.lerp(cameraTarget.current, lerpFactor);
    camera.lookAt(playerPosition.x, playerPosition.y + 2, playerPosition.z);
  });

  return (
    <group>
      <RigidBody
        ref={playerRef}
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
        lockRotations
        type="dynamic"
        colliders={false}
        friction={0.5}
        restitution={0}
      >
        <group ref={playerModelRef}>
          <CapsuleCollider args={[0.5, 0.5]} />
          <mesh castShadow>
            <capsuleGeometry args={[0.5, 1, 4]} />
            <meshStandardMaterial color="#4080E0" />
          </mesh>
          <mesh position={[0, 0.5, 0.4]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#202020" />
          </mesh>
          {canDash ? null : (
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#FF4040" />
            </mesh>
          )}
        </group>
      </RigidBody>
    </group>
  );
}
