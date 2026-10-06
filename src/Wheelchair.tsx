import { useMemo } from 'react'
import { CylinderGeometry, Path, QuadraticBezierCurve3, Quaternion, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three'
import { DEFAULT_CONFIG, deriveGeometry, WHEEL, type Point } from './geometry'
import { deriveMannequin } from './mannequin'

const metal = '#516978'
const fabric = '#283b49'
const PUSH_RIM_OFFSET = 0.032

function Tube({ from, to, radius = 0.009, color = metal }: { from: Point; to: Point; radius?: number; color?: string }) {
  const start = new Vector3(...from)
  const end = new Vector3(...to)
  const direction = end.clone().sub(start)
  const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize())
  const geometry = useMemo(() => new CylinderGeometry(radius, radius, direction.length(), 10), [radius, direction.length()])
  return <mesh geometry={geometry} position={start.add(end).multiplyScalar(0.5)} quaternion={orientation} castShadow>
    <meshStandardMaterial color={color} metalness={0.65} roughness={0.35} />
  </mesh>
}

function BentTube({ from, control, to, radius }: { from: Point; control: Point; to: Point; radius: number }) {
  const geometry = useMemo(() => {
    const curve = new QuadraticBezierCurve3(new Vector3(...from), new Vector3(...control), new Vector3(...to))
    return new TubeGeometry(curve, 32, radius, 8, false)
  }, [from[0], from[1], from[2], control[0], control[1], control[2], to[0], to[1], to[2], radius])
  return <mesh geometry={geometry} castShadow>
    <meshStandardMaterial color={metal} metalness={0.65} roughness={0.35} />
  </mesh>
}

function PerforatedWheel({ radius, tire }: { radius: number; tire: number }) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    shape.absarc(0, 0, radius * 0.82, 0, Math.PI * 2, false)
    for (let index = 0; index < 10; index++) {
      const angle = index * Math.PI * 2 / 10
      const hole = new Path()
      hole.absarc(Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5, radius * 0.1, 0, Math.PI * 2, true)
      shape.holes.push(hole)
    }
    return new ShapeGeometry(shape, 48)
  }, [radius])
  return <group>
    {[-1, 1].map(side => <mesh key={side} geometry={geometry} position={[side * tire * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#111111" metalness={0.35} roughness={0.55} side={2} />
    </mesh>)}
  </group>
}

function Wheel({ center, radius, tire, camber = 0, spokes = 10, side = 0, hasPushRim = false, perforated = false }: { center: Point; radius: number; tire: number; camber?: number; spokes?: number; side?: number; hasPushRim?: boolean; perforated?: boolean }) {
  return <group position={center}>
    <group rotation={[0, 0, 0]}>
      <group rotation={[0, 0, camber]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[radius, tire, 12, 64]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.953, 0.004, 8, 48]} />
        <meshStandardMaterial color="#111111" metalness={0.45} roughness={0.4} />
      </mesh>
      {hasPushRim && <mesh position={[side * PUSH_RIM_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.85 * 1.1, 0.006, 8, 48]} />
        <meshStandardMaterial color="#9baeb8" metalness={0.7} roughness={0.3} />
      </mesh>}
      {perforated ? <PerforatedWheel radius={radius} tire={tire} /> : Array.from({ length: spokes }, (_, index) => {
        const angle = index * Math.PI * 2 / spokes
        return <Tube key={index} from={[0, 0, 0]} to={[0, Math.cos(angle) * radius * 0.953, Math.sin(angle) * radius * 0.953]} radius={0.002} color="#b23a4b" />
      })}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.045, 16]} />
        <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.35} />
      </mesh>
      </group>
    </group>
  </group>
}

function WireframeCylinder({ from, to, topRadius, bottomRadius, depthScale = 0.65, radialSegments = 16, heightSegments = 6 }: { from: Point; to: Point; topRadius: number; bottomRadius: number; depthScale?: number; radialSegments?: number; heightSegments?: number }) {
  const start = new Vector3(...from)
  const end = new Vector3(...to)
  const direction = end.clone().sub(start)
  const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize())
  return <mesh position={start.add(end).multiplyScalar(0.5)} quaternion={orientation} scale={[1, 1, depthScale]}>
    <cylinderGeometry args={[topRadius, bottomRadius, direction.length(), radialSegments, heightSegments, true]} />
    <meshBasicMaterial color="#da9b70" wireframe />
  </mesh>
}

function WireframeLink({ from, to, radius }: { from: Point; to: Point; radius: number }) {
  return <WireframeCylinder from={from} to={to} topRadius={radius * 0.8} bottomRadius={radius} />
}

function WireframeJoint({ center, radius, scale = [1, 1, 1] }: { center: Point; radius: number; scale?: [number, number, number] }) {
  return <mesh position={center} scale={scale}>
    <sphereGeometry args={[radius, 16, 12]} />
    <meshBasicMaterial color="#da9b70" wireframe />
  </mesh>
}

function WireframeHand({ center, side }: { center: Point; side: number }) {
  return <group>
    <WireframeJoint center={center} radius={0.018} scale={[0.75, 1.2, 0.65]} />
    {[-1.5, -0.5, 0.5, 1.5].map((spread, index) => {
      const start: Point = [center[0], center[1] - 0.012, center[2] + spread * 0.004]
      const end: Point = [center[0] + side * 0.004, center[1] - 0.043 + (index === 0 || index === 3 ? 0.006 : 0), center[2] + spread * 0.006]
      return <WireframeLink key={spread} from={start} to={end} radius={0.004} />
    })}
    <WireframeLink from={[center[0], center[1], center[2] - side * 0.012]} to={[center[0] + side * 0.008, center[1] - 0.025, center[2] - side * 0.02]} radius={0.005} />
  </group>
}

function WireframeFoot({ center, side }: { center: Point; side: number }) {
  return <group>
    <WireframeJoint center={center} radius={0.026} scale={[0.8, 0.65, 1.6]} />
    {[-1.5, -0.5, 0.5, 1.5].map((spread, index) => {
      const start: Point = [center[0] + spread * 0.006, center[1], center[2] + 0.025]
      const end: Point = [start[0] + side * (index === 3 ? -0.002 : 0.002), center[1] - 0.006, center[2] + 0.05]
      return <WireframeLink key={spread} from={start} to={end} radius={0.004} />
    })}
  </group>
}

function Mannequin({ chair }: { chair: ReturnType<typeof deriveGeometry> }) {
  const figure = deriveMannequin(chair)
  const hipCenter = new Vector3(...figure.hipCenter)
  const shoulderCenter = new Vector3(...figure.shoulderCenter)
  const waistCenter = hipCenter.clone().lerp(shoulderCenter, 0.32).toArray() as Point
  const chestCenter = hipCenter.clone().lerp(shoulderCenter, 0.76).toArray() as Point
  const neckTop: Point = [0, figure.head.center[1] - figure.head.radius, figure.head.center[2]]
  return <group name="mannequin">
    <WireframeCylinder from={figure.hipCenter} to={waistCenter} topRadius={chair.seat.width * 0.405} bottomRadius={chair.seat.width * 0.43} depthScale={0.55} radialSegments={19} heightSegments={7} />
    <WireframeCylinder from={waistCenter} to={chestCenter} topRadius={chair.seat.width * 0.42} bottomRadius={chair.seat.width * 0.405} depthScale={0.52} radialSegments={19} heightSegments={7} />
    <WireframeCylinder from={chestCenter} to={figure.shoulderCenter} topRadius={chair.seat.width * 0.45} bottomRadius={chair.seat.width * 0.42} depthScale={0.62} radialSegments={19} heightSegments={7} />
    <WireframeLink from={figure.shoulderCenter} to={neckTop} radius={0.045} />
    {figure.arms.map(([shoulder, elbow, hand], index) => <group key={`arm-${index}`}>
      <WireframeLink from={shoulder} to={elbow} radius={0.035} />
      <WireframeLink from={elbow} to={hand} radius={0.025} />
      <WireframeJoint center={elbow} radius={0.035} />
      <WireframeHand center={hand} side={index === 0 ? -1 : 1} />
    </group>)}
    {figure.hips.map((hip, index) => <group key={`leg-${index}`}>
      <WireframeLink from={hip} to={figure.knees[index]} radius={0.055} />
      <WireframeLink from={figure.knees[index]} to={figure.ankles[index]} radius={0.035} />
      <WireframeLink from={figure.ankles[index]} to={figure.toes[index]} radius={0.025} />
      <WireframeJoint center={figure.knees[index]} radius={0.045} />
      <WireframeJoint center={figure.ankles[index]} radius={0.03} />
      <WireframeFoot center={figure.toes[index]} side={index === 0 ? -1 : 1} />
    </group>)}
    <mesh position={figure.head.center}>
      <sphereGeometry args={[figure.head.radius, 19, 15]} />
      <meshBasicMaterial color="#da9b70" wireframe />
    </mesh>
  </group>
}

export function Wheelchair({ configuration, foldProgress = 0, showMannequin = false }: { configuration: typeof DEFAULT_CONFIG; foldProgress?: number; showMannequin?: boolean }) {
  const chair = deriveGeometry(configuration, foldProgress)
  const { seat, backrest, rearWheels, axleTube, rearFrameConnections, rearFrameMidConnections, casters, frontFrame, footrest } = chair
  const sidePoints = (side: number) => ({
    front: [side * (frontFrame.upperSpacing / 2 + 0.01), frontFrame.upperLeft[1], frontFrame.upperLeft[2]] as Point,
    rear: [side * seat.width / 2, seat.seatRear[1], seat.seatRear[2]] as Point,
    lower: side < 0 ? frontFrame.lowerLeft : frontFrame.lowerRight,
  })
  return <group>
    <mesh position={seat.surfaceCenter} rotation={[-seat.tilt, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[seat.width, 0.018, seat.surfaceDepth]} />
      <meshStandardMaterial color={fabric} roughness={0.85} />
    </mesh>
    <mesh position={[0, (backrest.base[1] + backrest.top[1]) / 2, (backrest.base[2] + backrest.top[2]) / 2]} rotation={[Math.PI / 2 - backrest.angle, 0, 0]} castShadow>
      <boxGeometry args={[seat.width, backrest.height, 0.015]} />
      <meshStandardMaterial color={fabric} roughness={0.85} side={2} />
    </mesh>
    {([-1, 1] as const).map((side, index) => {
      const points = sidePoints(side)
      const wheel = rearWheels[index]
      const rearFrameConnection = rearFrameConnections[index]
      const rearFrameMidConnection = rearFrameMidConnections[index]
      const backrestSupport = backrest.supports[index]
      const caster = casters[index]
      return <group key={side}>
        <Tube from={points.front} to={points.rear} />
        <Tube from={points.front} to={points.lower} />
        <Tube from={rearFrameConnection.seatPoint} to={rearFrameConnection.axlePoint} />
        <Tube from={rearFrameMidConnection.seatPoint} to={rearFrameMidConnection.axlePoint} />
        <Tube from={backrestSupport.base} to={backrestSupport.top} radius={0.011} />
        <Tube from={caster.forkStem[0]} to={caster.forkStem[1]} radius={0.007} />
        <Tube from={caster.forkLegs[0][0]} to={caster.forkLegs[0][1]} radius={0.006} />
        <Tube from={caster.forkLegs[1][0]} to={caster.forkLegs[1][1]} radius={0.006} />
        <Tube from={caster.forkLegs[0][0]} to={caster.forkLegs[1][0]} radius={0.006} />
        <Tube from={caster.forkAxle[0]} to={caster.forkAxle[1]} radius={0.004} />
        <Wheel center={wheel.center} radius={WHEEL.rearRadius} tire={WHEEL.rearTire} camber={wheel.camber} side={side} hasPushRim />
        <Wheel center={caster.center} radius={WHEEL.casterRadius} tire={WHEEL.casterTire} perforated />
      </group>
    })}
    {frontFrame.seatRods.map((rod, index) => <BentTube key={index} from={rod.start} control={rod.control} to={rod.end} radius={rod.radius} />)}
    <Tube from={frontFrame.crossbar.start} to={frontFrame.crossbar.end} radius={frontFrame.crossbar.radius} />
    {footrest.supports.map(([from, to], index) => <Tube key={index} from={from} to={to} radius={0.005} />)}
    <mesh position={footrest.center} rotation={[-footrest.angle, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[footrest.width, footrest.thickness, footrest.depth]} />
      <meshStandardMaterial color="#516978" roughness={0.72} />
    </mesh>
    <Tube from={axleTube.start} to={axleTube.end} radius={0.012} />
    <Tube from={backrest.supports[0].top} to={backrest.supports[1].top} radius={0.009} />
    {showMannequin && <Mannequin chair={chair} />}
  </group>
}
