import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Rock from "./components/Rock";

function App() {
  return (
    <Canvas
      camera={{
        position: [0, 10, 20],
        fov: 60,
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Rock scale={0.5} position={[0, -1, 0]} />
      <OrbitControls enableZoom={true} />
      <Environment preset="sunset" background />
    </Canvas>
  );
}

export default App;
