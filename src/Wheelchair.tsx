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

function Wheel({ center, radius, tire, camber = 0, spokes = 10 }: { center: Point; radius: number; tire: number; camber?: number; spokes?: number }) {
  return <group position={center} rotation={[0, 0, camber]}>
    <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
      <torusGeometry args={[radius, tire, 12, 64]} />
      <meshStandardMaterial color="#202832" roughness={0.9} />
    </mesh>
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[radius * 0.85, 0.004, 8, 48]} />
      <meshStandardMaterial color="#9baeb8" metalness={0.7} roughness={0.3} />
    </mesh>
    {Array.from({ length: spokes }, (_, index) => {
      const angle = index * Math.PI * 2 / spokes
      return <Tube key={index} from={[0, 0, 0]} to={[0, Math.cos(angle) * radius * 0.85, Math.sin(angle) * radius * 0.85]} radius={0.002} color="#b9c8cc" />
    })}
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.045, 16]} />
      <meshStandardMaterial color="#657e8c" metalness={0.6} roughness={0.35} />
    </mesh>
  </group>
}

export function Wheelchair() {
  const { seat, backrest, rearWheels, casters } = deriveGeometry(DEFAULT_CONFIG)
  const half = seat.width / 2
  const frameOffset = half + 0.022
  const sidePoints = (side: number) => ({
    front: [side * frameOffset, seat.front[1] - 0.024, seat.front[2]] as Point,
    rear: [side * frameOffset, seat.rear[1] - 0.024, seat.rear[2]] as Point,
    lower: [side * frameOffset, 0.25, seat.front[2] + 0.07] as Point,
    backBase: [side * frameOffset, backrest.base[1], backrest.base[2]] as Point,
    backTop: [side * frameOffset, backrest.top[1], backrest.top[2]] as Point,
  })
  return <group>
    <mesh position={[0, (seat.front[1] + seat.rear[1]) / 2 - 0.009, 0]} rotation={[-seat.tilt, 0, 0]} castShadow receiveShadow>
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
        <Tube from={points.lower} to={points.rear} />
        <Tube from={points.rear} to={wheel.center} />
        <Tube from={points.backBase} to={points.backTop} radius={0.011} />
        <Tube from={points.lower} to={[caster.center[0], caster.center[1] + 0.04, caster.center[2]]} />
        <Wheel center={wheel.center} radius={WHEEL.rearRadius} tire={WHEEL.rearTire} camber={wheel.camber} />
        <Wheel center={caster.center} radius={WHEEL.casterRadius} tire={WHEEL.casterTire} spokes={5} />
        <Tube from={points.front} to={[side * frameOffset, 0.18, seat.front[2] + 0.12]} />
        <Tube from={[side * frameOffset, 0.18, seat.front[2] + 0.12]} to={[side * frameOffset, 0.18, seat.front[2] + 0.25]} />
      </group>
    })}
    <Tube from={[-frameOffset, 0.18, seat.front[2] + 0.25]} to={[frameOffset, 0.18, seat.front[2] + 0.25]} radius={0.014} />
    <Tube from={[-frameOffset, backrest.top[1], backrest.top[2]]} to={[frameOffset, backrest.top[1], backrest.top[2]]} radius={0.009} />
  </group>
}
