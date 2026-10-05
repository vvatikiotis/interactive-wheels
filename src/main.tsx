import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Wheelchair } from './Wheelchair'
import { DEFAULT_CONFIG, type WheelchairConfig } from './geometry'
import './style.css'

function App() {
  const [configuration, setConfiguration] = useState<WheelchairConfig>({ ...DEFAULT_CONFIG })
  const controls: { key: keyof WheelchairConfig; label: string; min: number; max: number; unit: string }[] = [
    { key: 'seatWidth', label: 'Seat width', min: 33, max: 46, unit: 'cm' },
    { key: 'seatDepth', label: 'Seat depth', min: 36, max: 46, unit: 'cm' },
    { key: 'wheelCamber', label: 'Rear-wheel camber', min: 0, max: 6, unit: '°' },
    { key: 'rearAxlePosition', label: 'Rear axle position', min: -5, max: 12, unit: 'cm' },
    { key: 'backrestHeight', label: 'Backrest height', min: 25, max: 45, unit: 'cm' },
    { key: 'backrestAngle', label: 'Backrest angle to seat', min: 80, max: 110, unit: '°' },
    { key: 'seatAngle', label: 'Seat angle to ground', min: 0, max: 12, unit: '°' },
  ]

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
        {controls.map(control => {
          const value = configuration[control.key]
          const formatted = control.key === 'rearAxlePosition' && value > 0 ? `+${value}` : value
          return <div className="control" key={control.key}>
            <label htmlFor={control.key}>{control.label} <output>{formatted} {control.unit}</output></label>
            <input id={control.key} aria-label={control.label} type="range" min={control.min} max={control.max} step="1" value={value}
              onChange={event => setConfiguration(current => ({ ...current, [control.key]: Number(event.target.value) }))} />
            {control.key === 'rearAxlePosition' && <div className="range-labels"><span>Backward</span><span>Forward</span></div>}
          </div>
        })}
        <p className="explanation">Rear axle position is measured from the rear edge of the seat. No tipping point is calculated.</p>
      </aside>
    </section>
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
