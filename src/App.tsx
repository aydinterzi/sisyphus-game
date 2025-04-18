import { Canvas } from "@react-three/fiber";
import { OrbitControls, KeyboardControls } from "@react-three/drei";
import Game from "./components/Game";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";

function App() {
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "KeyW"] },
        { name: "backward", keys: ["ArrowDown", "KeyS"] },
        { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
        { name: "rightward", keys: ["ArrowRight", "KeyD"] },
        { name: "jump", keys: ["Space"] },
      ]}
    >
      <Canvas
        camera={{
          position: [0, 10, 20],
          fov: 60,
        }}
      >
        <Suspense>
          <Physics>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Game />
            <OrbitControls enableZoom={true} />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
