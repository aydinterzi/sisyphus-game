import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";

type Controls = "forward" | "backward" | "leftward" | "rightward" | "jump";

const MOVE_SPEED = 5;
const JUMP_FORCE = 5;
const CAMERA_OFFSET = new THREE.Vector3(0, 3, 8);
const LERP_FACTOR = 0.1;

export default function Player() {
  const playerRef = useRef<RapierRigidBody>(null);
  const isOnGroundRef = useRef(false);

  const { camera } = useThree();
  const cameraTarget = useRef(new THREE.Vector3());

  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  const [, get] = useKeyboardControls<Controls>();

  useFrame(() => {
    if (!playerRef.current) return;

    const { forward, backward, leftward, rightward, jump } = get();

    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(leftward) - Number(rightward), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED)
      .applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

    const velocity = playerRef.current.linvel();

    playerRef.current.setLinvel(
      {
        x: direction.x,
        y: velocity.y,
        z: direction.z,
      },
      true
    );

    if (jump && isOnGroundRef.current) {
      playerRef.current.setLinvel(
        {
          x: velocity.x,
          y: JUMP_FORCE,
          z: velocity.z,
        },
        true
      );
      isOnGroundRef.current = false;
    }

    const playerPosition = playerRef.current.translation();
    cameraTarget.current.set(
      playerPosition.x,
      playerPosition.y + CAMERA_OFFSET.y,
      playerPosition.z + CAMERA_OFFSET.z
    );

    camera.position.lerp(cameraTarget.current, LERP_FACTOR);
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
        onCollisionEnter={() => {
          isOnGroundRef.current = true;
        }}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial color="#4080E0" />
        </mesh>
        <mesh position={[0, 0.5, 0.4]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#202020" />
        </mesh>
      </RigidBody>
    </group>
  );
}
