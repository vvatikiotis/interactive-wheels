import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Wheelchair } from './Wheelchair'
import './style.css'

function App() {
  return <main>
    <header>
      <div>
        <p className="eyebrow">Interactive wheelchair · First checkpoint</p>
        <h1>Rigid-frame wheelchair</h1>
        <p>Drag to rotate · Scroll to zoom</p>
      </div>
      <p className="note">Default chair preview. Adjustments and folding come next.</p>
    </header>
    <section className="viewport" aria-label="3D wheelchair viewer">
      <Canvas shadows camera={{ position: [0.9, 0.8, 1.2], fov: 40 }}>
        <color attach="background" args={['#edf2f3']} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[1.5, 2.5, 2]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} />
        <Wheelchair />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#dce6e7" roughness={1} />
        </mesh>
        <OrbitControls target={[0, 0.35, 0]} enablePan={false} minDistance={0.85} maxDistance={3} maxPolarAngle={Math.PI / 2 - 0.03} />
      </Canvas>
    </section>
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
