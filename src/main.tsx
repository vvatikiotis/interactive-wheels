import { useEffect, useRef, useState, type ComponentRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Wheelchair } from './Wheelchair'
import { DEFAULT_CONFIG, deriveGeometry, type WheelchairConfig } from './geometry'
import './style.css'

const INITIAL_CAMERA_POSITION = [0.9, 0.8, 1.55] as const
const INITIAL_CAMERA_TARGET = [0, 0.35, 0] as const

function App() {
  const orbitControls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const [configuration, setConfiguration] = useState<WheelchairConfig>({ ...DEFAULT_CONFIG })
  const [foldPhase, setFoldPhase] = useState<'unfolded' | 'folding' | 'folded' | 'unfolding'>('unfolded')
  const [foldProgress, setFoldProgress] = useState(0)
  const [showMannequin, setShowMannequin] = useState(false)
  useEffect(() => {
    if (foldPhase !== 'folding' && foldPhase !== 'unfolding') return
    let frame: number
    let start: number | undefined
    const tick = (time: number) => {
      start ??= time
      const fraction = Math.min((time - start) / 400, 1)
      setFoldProgress(foldPhase === 'folding' ? fraction : 1 - fraction)
      if (fraction < 1) frame = requestAnimationFrame(tick)
      else setFoldPhase(foldPhase === 'folding' ? 'folded' : 'unfolded')
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [foldPhase])
  const helpText: Record<keyof WheelchairConfig, string> = {
    seatWidth: 'Seating surface width, excluding tubing.', seatDepth: 'Full front-to-back measurement; front 10% is uncovered.',
    wheelCamber: 'Positive brings wheel tops inward.', rearAxlePosition: 'Position is forward from the seat’s rear edge; zero aligns wheel centres beneath it.',
    backrestHeight: 'Measured along the backrest.', backrestAngle: '90° is perpendicular to the seat; larger values lean backward.',
    backrestCurvature: 'Inward depth at fabric centre; higher values wrap the sides around the torso.',
    seatAngle: 'Positive lowers the rear while front height remains fixed.', footrestSlope: 'Positive raises the front edge relative to the ground.',
    frontCrossbarHeight: 'Crossbar centreline height above ground; lower front frame tube ends and attached footplate move with it.',
  }
  const controlGroups: { name: string; keys: (keyof WheelchairConfig)[] }[] = [
    { name: 'Seat', keys: ['seatWidth', 'seatDepth', 'seatAngle'] },
    { name: 'Backrest', keys: ['backrestHeight', 'backrestAngle', 'backrestCurvature'] },
    { name: 'Wheels', keys: ['wheelCamber', 'rearAxlePosition'] },
    { name: 'Footplate/frame', keys: ['footrestSlope', 'frontCrossbarHeight'] },
  ]
  const controls: { key: keyof WheelchairConfig; label: string; min: number; max: number; unit: string }[] = [
    { key: 'seatWidth', label: 'Seat width', min: 33, max: 46, unit: 'cm' },
    { key: 'seatDepth', label: 'Seat depth', min: 36, max: 46, unit: 'cm' },
    { key: 'wheelCamber', label: 'Rear-wheel camber', min: -4, max: 6, unit: '°' },
    { key: 'rearAxlePosition', label: 'Rear axle position', min: 0, max: 12, unit: 'cm' },
    { key: 'backrestHeight', label: 'Backrest height', min: 10, max: 45, unit: 'cm' },
    { key: 'backrestAngle', label: 'Backrest angle to seat', min: 80, max: 110, unit: '°' },
    { key: 'backrestCurvature', label: 'Backrest curvature', min: 0, max: 10, unit: 'cm' },
    { key: 'seatAngle', label: 'Seat angle to ground', min: 0, max: 12, unit: '°' },
    { key: 'footrestSlope', label: 'Footplate slope', min: 0, max: 15, unit: '°' },
    { key: 'frontCrossbarHeight', label: 'Front crossbar height', min: 2, max: 10, unit: 'cm' },
  ]

  return <>
  <main>
    <header>
      <div>
        <h1>Interactive Wheels - Alli Opsi</h1>
      </div>
      <div className="header-links">
        <a className="github-link" href="https://github.com/vvatikiotis/interactive-wheels" target="_blank" rel="noreferrer" aria-label="View source on GitHub">
          <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" />
        </a>
        <p className="viewer-hint">Drag to rotate · Scroll to zoom</p>
      </div>
    </header>
    <section className="workspace">
      <section className="viewport" aria-label="3D wheelchair viewer">
        <Canvas shadows camera={{ position: INITIAL_CAMERA_POSITION, fov: 40 }}>
          <color attach="background" args={['#edf2f3']} />
          <ambientLight intensity={1.6} />
          <directionalLight position={[1.5, 2.5, 2]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} />
          <Wheelchair configuration={configuration} foldProgress={foldProgress} showMannequin={showMannequin && foldPhase === 'unfolded'} />
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#cdd9dc" roughness={1} />
          </mesh>
          <gridHelper args={[6, 30, '#617f89', '#839da6']} position={[0, 0.002, 0]} />
          <OrbitControls ref={orbitControls} target={[...INITIAL_CAMERA_TARGET]} enablePan={false} minDistance={0.85} maxDistance={3} maxPolarAngle={Math.PI / 2 - 0.03} />
        </Canvas>
      </section>
      <aside className="controls" aria-label="Wheelchair adjustments">
        <h2>Adjustments</h2>
        <p className="purpose">Visual wheelchair geometry only—not a fit or safety assessment.</p>
        {controlGroups.map(group => <fieldset className="control-group" key={group.name}>
          <legend>{group.name}</legend>
          {group.keys.map(key => {
            const control = controls.find(item => item.key === key)!
          const value = configuration[control.key]
          const formatted = control.key === 'rearAxlePosition' && value > 0 ? `+${value}` : value
          return <div className="control" key={control.key}>
            <div className="control-label">
              <label htmlFor={control.key}>{control.label} <output>{formatted} {control.unit}</output></label>
              <details className="control-help"><summary aria-label={`Help for ${control.label}`} title={`More information about ${control.label}`}>?</summary><span id={`${control.key}-help`}>{helpText[control.key]}</span></details>
            </div>
            <input id={control.key} aria-label={control.label} aria-describedby={`${control.key}-help`} type="range" min={control.min} max={control.max} step={control.key === 'frontCrossbarHeight' ? 0.1 : 1} value={value} disabled={foldPhase !== 'unfolded'}
              onChange={event => setConfiguration(current => ({ ...current, [control.key]: Number(event.target.value) }))} />
            {control.key === 'rearAxlePosition' && <div className="range-labels"><span>Backward</span><span>Forward</span></div>}
          </div>
          })}
        </fieldset>)}
        <button className="fold-button" type="button" disabled={foldPhase === 'folding' || foldPhase === 'unfolding'}
          onClick={() => setFoldPhase(foldPhase === 'folded' ? 'unfolding' : 'folding')}>
          {foldPhase === 'folding' ? 'Folding…' : foldPhase === 'unfolding' ? 'Unfolding…' : foldPhase === 'folded' ? 'Unfold' : 'Fold'}
        </button>
        <div className="mannequin-row">
          <button className="mannequin-button" type="button" aria-describedby="mannequin-note" aria-pressed={showMannequin} disabled={foldPhase !== 'unfolded'}
            onClick={() => setShowMannequin(visible => !visible)}>
            {showMannequin ? 'Hide mannequin' : 'Show mannequin'}
          </button>
          <details className="control-help mannequin-help"><summary aria-label="Help for mannequin limitations" title="Mannequin limitations">?</summary><span id="mannequin-note">Visual scale cue only; not anatomical or fit model.</span></details>
        </div>
        <div className="reset-actions">
          <button type="button" onClick={() => {
            setFoldPhase('unfolded')
            setFoldProgress(0)
            setConfiguration({ ...DEFAULT_CONFIG })
          }}>Reset configuration</button>
          <button type="button" onClick={() => {
            const controls = orbitControls.current
            if (!controls) return
            const damping = controls.enableDamping
            controls.enableDamping = false
            controls.update()
            controls.target.set(...INITIAL_CAMERA_TARGET)
            controls.object.position.set(...INITIAL_CAMERA_POSITION)
            controls.update()
            controls.enableDamping = damping
          }}>Reset view</button>
        </div>
      </aside>
    </section>
  </main>
  <footer>Vassilis Vatikiotis - AI assisted - 2026</footer>
  </>
}

createRoot(document.getElementById('root')!).render(<App />)
