import { useMemo } from 'react'
import { CylinderGeometry, Quaternion, Vector3 } from 'three'
import { DEFAULT_CONFIG, deriveGeometry, WHEEL, type Point } from './geometry'

const metal = '#516978'
const fabric = '#283b49'

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

function Wheel({ center, radius, tire, camber = 0, spokes = 10, side = 0, hasPushRim = false }: { center: Point; radius: number; tire: number; camber?: number; spokes?: number; side?: number; hasPushRim?: boolean }) {
  return <group position={center}>
    <group rotation={[0, 0, 0]}>
      <group rotation={[0, 0, camber]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[radius, tire, 12, 64]} />
        <meshStandardMaterial color="#202832" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.94, 0.004, 8, 48]} />
        <meshStandardMaterial color="#9baeb8" metalness={0.7} roughness={0.3} />
      </mesh>
      {hasPushRim && <mesh position={[side * 0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.85, 0.004, 8, 48]} />
        <meshStandardMaterial color="#9baeb8" metalness={0.7} roughness={0.3} />
      </mesh>}
      {Array.from({ length: spokes }, (_, index) => {
        const angle = index * Math.PI * 2 / spokes
        return <Tube key={index} from={[0, 0, 0]} to={[0, Math.cos(angle) * radius * 0.94, Math.sin(angle) * radius * 0.94]} radius={0.002} color="#b9c8cc" />
      })}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.045, 16]} />
        <meshStandardMaterial color="#657e8c" metalness={0.6} roughness={0.35} />
      </mesh>
      </group>
    </group>
  </group>
}

export function Wheelchair({ configuration }: { configuration: typeof DEFAULT_CONFIG }) {
  const { seat, backrest, rearWheels, axleTube, casters, frontFrame, footrest } = deriveGeometry(configuration)
  const frameOffset = seat.width / 2 + 0.022
  const sidePoints = (side: number) => ({
    front: [side * (frontFrame.upperSpacing / 2 + 0.01), seat.seatForward[1], seat.seatForward[2]] as Point,
    rear: [side * frameOffset, seat.seatRear[1], seat.seatRear[2]] as Point,
    lower: side < 0 ? frontFrame.lowerLeft : frontFrame.lowerRight,
    backBase: [side * frameOffset, backrest.base[1], backrest.base[2]] as Point,
    backTop: [side * frameOffset, backrest.top[1], backrest.top[2]] as Point,
  })
  return <group>
    <mesh position={[0, (seat.front[1] + seat.rear[1]) / 2 - 0.009 * Math.cos(seat.tilt), 0]} rotation={[-seat.tilt, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[seat.width, 0.018, seat.depth]} />
      <meshStandardMaterial color={fabric} roughness={0.85} />
    </mesh>
    <mesh position={[0, (backrest.base[1] + backrest.top[1]) / 2, (backrest.base[2] + backrest.top[2]) / 2]} rotation={[Math.PI / 2 - backrest.angle, 0, 0]} castShadow>
      <boxGeometry args={[seat.width, backrest.height, 0.015]} />
      <meshStandardMaterial color={fabric} roughness={0.85} side={2} />
    </mesh>
    {([-1, 1] as const).map((side, index) => {
      const points = sidePoints(side)
      const wheel = rearWheels[index]
      const caster = casters[index]
      return <group key={side}>
        <Tube from={points.front} to={points.rear} />
        <Tube from={points.front} to={points.lower} />
        <Tube from={points.rear} to={[wheel.center[0], points.rear[1], wheel.center[2]]} />
        <Tube from={[wheel.center[0], points.rear[1], wheel.center[2]]} to={wheel.center} />
        <Tube from={points.backBase} to={points.backTop} radius={0.011} />
        <Tube from={caster.forkAttachment} to={caster.center} />
        <Wheel center={wheel.center} radius={WHEEL.rearRadius} tire={WHEEL.rearTire} camber={wheel.camber} side={side} hasPushRim />
        <Wheel center={caster.center} radius={WHEEL.casterRadius} tire={WHEEL.casterTire} spokes={5} />
      </group>
    })}
    <Tube from={frontFrame.upperLeft} to={frontFrame.upperRight} radius={0.008} />
    <Tube from={frontFrame.crossbar.start} to={frontFrame.crossbar.end} radius={frontFrame.crossbar.radius} />
    <mesh position={footrest.center} castShadow receiveShadow>
      <boxGeometry args={[footrest.width, 0.018, footrest.depth]} />
      <meshStandardMaterial color="#516978" roughness={0.72} />
    </mesh>
    <Tube from={axleTube.start} to={axleTube.end} radius={0.012} />
    <Tube from={[-frameOffset, backrest.top[1], backrest.top[2]]} to={[frameOffset, backrest.top[1], backrest.top[2]]} radius={0.009} />
  </group>
}
