import { useMemo } from 'react'
import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, Path, QuadraticBezierCurve3, Quaternion, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three'
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

function BackrestFabric({ backrest, width }: { backrest: ReturnType<typeof deriveGeometry>['backrest']; width: number }) {
  const geometry = useMemo(() => {
    const widthSegments = 20
    const heightSegments = 8
    const columns = widthSegments + 1
    const rows = heightSegments + 1
    const surfaceSize = columns * rows
    const positions: number[] = []
    const indices: number[] = []
    for (let surface = 0; surface < 2; surface++) {
      for (let row = 0; row <= heightSegments; row++) {
        const y = (row / heightSegments - 0.5) * backrest.height
        for (let column = 0; column <= widthSegments; column++) {
          const x = (column / widthSegments - 0.5) * width
          const normalizedX = 2 * x / width
          const curve = -backrest.curvature * (1 - normalizedX * normalizedX)
          positions.push(x, y, curve + (surface === 0 ? 0.0075 : -0.0075))
        }
      }
      const offset = surface * surfaceSize
      for (let row = 0; row < heightSegments; row++) for (let column = 0; column < widthSegments; column++) {
        const a = offset + row * columns + column
        const b = a + 1
        const c = a + columns
        const d = c + 1
        indices.push(...(surface === 0 ? [a, c, b, b, c, d] : [a, b, c, b, d, c]))
      }
    }
    const addEdge = (front: number, back: number, nextFront: number, nextBack: number) => indices.push(front, nextFront, back, back, nextFront, nextBack)
    for (let row = 0; row < heightSegments; row++) {
      addEdge(row * columns, surfaceSize + row * columns, (row + 1) * columns, surfaceSize + (row + 1) * columns)
      const right = row * columns + widthSegments
      addEdge(right, surfaceSize + right, right + columns, surfaceSize + right + columns)
    }
    for (let column = 0; column < widthSegments; column++) {
      addEdge(column, surfaceSize + column, column + 1, surfaceSize + column + 1)
      const top = heightSegments * columns + column
      addEdge(top, surfaceSize + top, top + 1, surfaceSize + top + 1)
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [backrest.curvature, backrest.height, width])
  const center = new Vector3(...backrest.base).add(new Vector3(...backrest.top)).multiplyScalar(0.5)
  return <mesh geometry={geometry} position={center} rotation={[Math.PI / 2 - backrest.angle, 0, 0]} castShadow receiveShadow>
    <meshStandardMaterial color={fabric} roughness={0.85} side={2} />
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

function WireframeCylinder({ from, to, topRadius, bottomRadius, depthScale = 0.65, radialSegments = 20, heightSegments = 8 }: { from: Point; to: Point; topRadius: number; bottomRadius: number; depthScale?: number; radialSegments?: number; heightSegments?: number }) {
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

function WireframeLimb({ from, to, proximalRadius, fullestRadius, distalRadius, depthScale = 0.72 }: { from: Point; to: Point; proximalRadius: number; fullestRadius: number; distalRadius: number; depthScale?: number }) {
  const geometry = useMemo(() => {
    const start = new Vector3(...from)
    const direction = new Vector3(...to).sub(start)
    const axis = direction.clone().normalize()
    const widthAxis = new Vector3(1, 0, 0).addScaledVector(axis, -axis.x).normalize()
    const depthAxis = widthAxis.clone().cross(axis).normalize()
    const profile = [
      { along: 0, radius: proximalRadius * 0.8 },
      { along: 0.18, radius: proximalRadius },
      { along: 0.4, radius: fullestRadius },
      { along: 0.68, radius: fullestRadius * 0.94 },
      { along: 0.88, radius: distalRadius },
      { along: 1, radius: distalRadius * 0.8 },
    ]
    const subdivisions = 3
    const rings = profile.slice(0, -1).flatMap((section, index) => Array.from({ length: subdivisions }, (_, step) => {
      const next = profile[index + 1]
      const amount = step / subdivisions
      return { along: section.along + (next.along - section.along) * amount, radius: section.radius + (next.radius - section.radius) * amount }
    })).concat(profile.at(-1)!)
    const radialSegments = 16
    const vertices: number[] = []
    const indices: number[] = []
    rings.forEach(ring => {
      const center = start.clone().addScaledVector(direction, ring.along)
      for (let segment = 0; segment <= radialSegments; segment++) {
        const angle = segment / radialSegments * Math.PI * 2
        const point = center.clone()
          .addScaledVector(widthAxis, Math.cos(angle) * ring.radius)
          .addScaledVector(depthAxis, Math.sin(angle) * ring.radius * depthScale)
        vertices.push(point.x, point.y, point.z)
      }
    })
    for (let ring = 0; ring < rings.length - 1; ring++) {
      for (let segment = 0; segment < radialSegments; segment++) {
        const current = ring * (radialSegments + 1) + segment
        const next = current + radialSegments + 1
        indices.push(current, next, current + 1, current + 1, next, next + 1)
      }
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [from[0], from[1], from[2], to[0], to[1], to[2], proximalRadius, fullestRadius, distalRadius, depthScale])

  return <mesh geometry={geometry}>
    <meshBasicMaterial color="#da9b70" wireframe />
  </mesh>
}

function WireframeJoint({ center, radius, scale = [1, 1, 1] }: { center: Point; radius: number; scale?: [number, number, number] }) {
  return <mesh position={center} scale={scale}>
    <sphereGeometry args={[radius, 20, 15]} />
    <meshBasicMaterial color="#da9b70" wireframe />
  </mesh>
}

function WireframeTorso({ hipCenter, shoulderCenter, seatWidth }: { hipCenter: Point; shoulderCenter: Point; seatWidth: number }) {
  const geometry = useMemo(() => {
    // Broad pelvis, narrower waist, then expanding ribcage and shoulder lines.
    const profile = [
      { along: 0, halfWidth: 0.3, halfDepth: 0.19 },
      { along: 0.14, halfWidth: 0.36, halfDepth: 0.24 },
      { along: 0.3, halfWidth: 0.33, halfDepth: 0.22 },
      { along: 0.44, halfWidth: 0.27, halfDepth: 0.18 },
      { along: 0.58, halfWidth: 0.3, halfDepth: 0.19 },
      { along: 0.74, halfWidth: 0.36, halfDepth: 0.22 },
      { along: 0.9, halfWidth: 0.41, halfDepth: 0.24 },
      { along: 1, halfWidth: 0.4, halfDepth: 0.21 },
    ]
    const subdivisions = 4
    const rings = profile.slice(0, -1).flatMap((section, index) => Array.from({ length: subdivisions }, (_, step) => {
      const next = profile[index + 1]
      const amount = step / subdivisions
      return {
        along: section.along + (next.along - section.along) * amount,
        halfWidth: section.halfWidth + (next.halfWidth - section.halfWidth) * amount,
        halfDepth: section.halfDepth + (next.halfDepth - section.halfDepth) * amount,
      }
    })).concat(profile.at(-1)!)
    const radialSegments = 32
    const axis = new Vector3(...shoulderCenter).sub(new Vector3(...hipCenter)).normalize()
    const depthAxis = new Vector3(0, -axis.z, axis.y)
    const origin = new Vector3(...hipCenter)
    const along = new Vector3(...shoulderCenter).sub(origin)
    const vertices: number[] = []
    const indices: number[] = []
    rings.forEach(ring => {
      const center = origin.clone().addScaledVector(along, ring.along)
      for (let segment = 0; segment <= radialSegments; segment++) {
        const angle = segment / radialSegments * Math.PI * 2
        const point = center.clone()
          .add(new Vector3(Math.cos(angle) * seatWidth * ring.halfWidth, 0, 0))
          .addScaledVector(depthAxis, Math.sin(angle) * seatWidth * ring.halfDepth)
        vertices.push(point.x, point.y, point.z)
      }
    })
    for (let ring = 0; ring < rings.length - 1; ring++) {
      for (let segment = 0; segment < radialSegments; segment++) {
        const current = ring * (radialSegments + 1) + segment
        const next = current + radialSegments + 1
        indices.push(current, next, current + 1, current + 1, next, next + 1)
      }
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [hipCenter[0], hipCenter[1], hipCenter[2], shoulderCenter[0], shoulderCenter[1], shoulderCenter[2], seatWidth])

  return <mesh geometry={geometry}>
    <meshBasicMaterial color="#da9b70" wireframe />
  </mesh>
}

function WireframeElbow({ center, side }: { center: Point; side: number }) {
  return <group>
    <WireframeJoint center={center} radius={0.027} scale={[0.85, 1.05, 0.95]} />
    <WireframeJoint center={[center[0] + side * 0.011, center[1] - 0.005, center[2]]} radius={0.01} scale={[0.65, 1, 0.75]} />
  </group>
}

function WireframeKnee({ center }: { center: Point }) {
  return <group>
    <WireframeJoint center={center} radius={0.043} scale={[1, 1.05, 1]} />
    <WireframeJoint center={[center[0], center[1], center[2] + 0.029]} radius={0.016} scale={[1.1, 0.85, 0.45]} />
  </group>
}

function WireframeHand({ center, side }: { center: Point; side: number }) {
  return <group>
    <WireframeJoint center={center} radius={0.016} scale={[0.8, 1.1, 0.8]} />
    {[-1.5, -0.5, 0.5, 1.5].map((spread, index) => {
      const start: Point = [center[0], center[1] - 0.012, center[2] + spread * 0.004]
      const knuckle: Point = [center[0] + side * 0.002, center[1] - 0.025, center[2] + spread * 0.006]
      const length = [0.027, 0.034, 0.036, 0.03][index]
      const tip: Point = [knuckle[0] + side * 0.002, center[1] - 0.012 - length, knuckle[2] + spread * 0.002]
      return <group key={spread}>
        <WireframeLink from={start} to={knuckle} radius={0.004} />
        <WireframeJoint center={knuckle} radius={0.0032} />
        <WireframeLink from={knuckle} to={tip} radius={0.0035} />
      </group>
    })}
    <WireframeLink from={[center[0], center[1], center[2] - side * 0.012]} to={[center[0] + side * 0.009, center[1] - 0.014, center[2] - side * 0.02]} radius={0.0055} />
    <WireframeLink from={[center[0] + side * 0.009, center[1] - 0.014, center[2] - side * 0.02]} to={[center[0] + side * 0.014, center[1] - 0.027, center[2] - side * 0.023]} radius={0.004} />
  </group>
}

function WireframeFoot({ center, side }: { center: Point; side: number }) {
  const toes = [
    { spread: 0.025, length: 0.045 },
    { spread: 0.012, length: 0.05 },
    { spread: 0, length: 0.046 },
    { spread: -0.012, length: 0.04 },
    { spread: -0.024, length: 0.033 },
  ]
  return <group>
    <WireframeJoint center={[center[0], center[1], center[2] - 0.012]} radius={0.033} scale={[0.9, 0.7, 1.45]} />
    {toes.map(({ spread, length }) => {
      const start: Point = [center[0] - side * spread, center[1] - 0.002, center[2] + 0.025]
      const tip: Point = [start[0] - side * spread * 0.12, center[1] - 0.006, center[2] + length]
      const middle: Point = [start[0] + (tip[0] - start[0]) * 0.55, center[1] - 0.004, center[2] + length * 0.55]
      return <group key={spread}>
        <WireframeLink from={start} to={middle} radius={0.0045} />
        <WireframeJoint center={middle} radius={0.0032} />
        <WireframeLink from={middle} to={tip} radius={0.0035} />
      </group>
    })}
  </group>
}

function Mannequin({ chair }: { chair: ReturnType<typeof deriveGeometry> }) {
  const figure = deriveMannequin(chair)
  const neckTop: Point = [0, figure.head.center[1] - figure.head.radius, figure.head.center[2]]
  return <group name="mannequin">
    <WireframeTorso hipCenter={figure.hipCenter} shoulderCenter={figure.shoulderCenter} seatWidth={chair.seat.width} />
    {figure.shoulders.map((shoulder, index) => <WireframeJoint key={`shoulder-${index}`} center={shoulder} radius={0.041} scale={[1.2, 0.95, 0.85]} />)}
    {figure.thighs.map((thigh, index) => <WireframeJoint key={`hip-${index}`} center={[thigh[0], thigh[1] + 0.025, thigh[2]]} radius={0.05} scale={[1, 0.75, 0.8]} />)}
    <WireframeLimb from={figure.shoulderCenter} to={neckTop} proximalRadius={0.04} fullestRadius={0.043} distalRadius={0.03} depthScale={0.82} />
    {figure.arms.map(([shoulder, elbow, hand], index) => <group key={`arm-${index}`}>
      <WireframeLimb from={shoulder} to={elbow} proximalRadius={0.035} fullestRadius={0.041} distalRadius={0.027} />
      <WireframeLimb from={elbow} to={hand} proximalRadius={0.027} fullestRadius={0.031} distalRadius={0.018} />
      <WireframeElbow center={elbow} side={index === 0 ? -1 : 1} />
      <WireframeHand center={hand} side={index === 0 ? -1 : 1} />
    </group>)}
    {figure.thighs.map((thigh, index) => <group key={`leg-${index}`}>
      <WireframeLimb from={thigh} to={figure.knees[index]} proximalRadius={0.066} fullestRadius={0.078} distalRadius={0.054} depthScale={0.78} />
      <WireframeLimb from={figure.knees[index]} to={figure.ankles[index]} proximalRadius={0.042} fullestRadius={0.05} distalRadius={0.032} depthScale={0.78} />
      <WireframeLink from={figure.ankles[index]} to={figure.toes[index]} radius={0.03} />
      <WireframeKnee center={figure.knees[index]} />
      <WireframeJoint center={figure.ankles[index]} radius={0.027} />
      <WireframeFoot center={figure.toes[index]} side={index === 0 ? -1 : 1} />
    </group>)}
    <WireframeJoint center={figure.head.center} radius={figure.head.radius} scale={[0.86, 1, 0.9]} />
    <WireframeJoint center={[0, figure.head.center[1] - 0.04, figure.head.center[2] + 0.012]} radius={0.036} scale={[0.9, 0.72, 0.8]} />
    <WireframeJoint center={[0, figure.head.center[1] - 0.005, figure.head.center[2] + 0.06]} radius={0.013} scale={[0.8, 1.2, 0.85]} />
    {[-1, 1].map(side => <WireframeJoint key={`ear-${side}`} center={[side * 0.058, figure.head.center[1], figure.head.center[2]]} radius={0.014} scale={[0.55, 1, 0.8]} />)}
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
    <BackrestFabric backrest={backrest} width={seat.width} />
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
    {showMannequin && <Mannequin chair={chair} />}
  </group>
}
