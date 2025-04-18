import { RigidBody } from "@react-three/rapier";
import Rock from "../components/Rock";
import Player from "./Player";

export default function Game() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30, 1]} />
          <meshStandardMaterial color={"#306030"} />
        </mesh>
      </RigidBody>

      <Player />

      <RigidBody position={[2, 4, 0]}>
        <Rock scale={0.5} position={[0, -1, 0]} />
      </RigidBody>
    </>
  );
}
