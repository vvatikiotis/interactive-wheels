import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Wheelchair } from './Wheelchair'
import { DEFAULT_CONFIG, type WheelchairConfig } from './geometry'
import './style.css'

function App() {
  const [configuration, setConfiguration] = useState<WheelchairConfig>({ ...DEFAULT_CONFIG })
  const axlePosition = configuration.rearAxlePosition

  return <main>
    <header>
      <div>
        <p className="eyebrow">Interactive wheelchair · Geometry checkpoint</p>
        <h1>Rigid-frame wheelchair</h1>
        <p>Drag to rotate · Scroll to zoom</p>
      </div>
      <p className="note">Use the slider to move both rear wheels and the axle tube.</p>
    </header>
    <section className="workspace">
      <section className="viewport" aria-label="3D wheelchair viewer">
        <Canvas shadows camera={{ position: [0.9, 0.8, 1.55], fov: 40 }}>
          <color attach="background" args={['#edf2f3']} />
          <ambientLight intensity={1.6} />
          <directionalLight position={[1.5, 2.5, 2]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} />
          <Wheelchair configuration={configuration} />
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#dce6e7" roughness={1} />
          </mesh>
          <OrbitControls target={[0, 0.35, 0]} enablePan={false} minDistance={0.85} maxDistance={3} maxPolarAngle={Math.PI / 2 - 0.03} />
        </Canvas>
      </section>
      <aside className="controls" aria-label="Wheelchair adjustments">
        <h2>Adjustments</h2>
        <label htmlFor="rear-axle-position">Rear axle position <output>{axlePosition > 0 ? '+' : ''}{axlePosition} cm</output></label>
        <input id="rear-axle-position" type="range" min="-5" max="12" step="1" value={axlePosition}
          onChange={event => setConfiguration(current => ({ ...current, rearAxlePosition: Number(event.target.value) }))} />
        <div className="range-labels"><span>Backward</span><span>Forward</span></div>
        <p className="explanation">Measured from the rear edge of the seat. No tipping point is calculated.</p>
      </aside>
    </section>
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
