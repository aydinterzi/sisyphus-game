import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BoxGeometry, MeshBasicMaterial } from "three";
function App() {
  return (
    <Canvas
      camera={{
        position: [0, 10, 20],
        fov: 60,
      }}
    >
      <OrbitControls />
      <mesh
        geometry={new BoxGeometry(1, 1, 1)}
        material={new MeshBasicMaterial()}
      />
    </Canvas>
  );
}

export default App;
