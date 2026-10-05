export interface WheelchairConfig {
  seatWidth: number
  seatDepth: number
  wheelCamber: number
  rearAxlePosition: number
  backrestHeight: number
  backrestAngle: number
  seatAngle: number
  footrestSlope: number
  footrestHeight: number
}

export type Point = [number, number, number]

export const DEFAULT_CONFIG: WheelchairConfig = {
  seatWidth: 39,
  seatDepth: 40,
  wheelCamber: 2,
  rearAxlePosition: 8,
  backrestHeight: 20,
  backrestAngle: 85,
  seatAngle: 6,
  footrestSlope: 0,
  footrestHeight: 7,
}

const radians = (degrees: number) => degrees * Math.PI / 180

export const WHEEL = { rearRadius: 0.295, rearTire: 0.01, casterRadius: 0.04, casterTire: 0.0104 }
export const FRONT_FRAME_ANGLE_DEGREES = 70

export function deriveGeometry(config: WheelchairConfig, foldProgress = 0) {
  const width = config.seatWidth / 100
  const depth = config.seatDepth / 100
  const tilt = radians(config.seatAngle)
  const camber = radians(config.wheelCamber)
  const front: Point = [0, 0.5, depth * Math.cos(tilt) / 2]
  const rear: Point = [0, 0.5 - depth * Math.sin(tilt), -depth * Math.cos(tilt) / 2]
  const seatForward = [0, front[1] - 0.009 * Math.cos(tilt), front[2] + 0.009 * Math.sin(tilt)] as Point
  const seatRear = [0, rear[1], rear[2]] as Point
  const surfaceDepth = depth * 0.9
  const surfaceCenter: Point = [0, (front[1] + rear[1]) / 2 - 0.009 * Math.cos(tilt) - depth * 0.05 * Math.sin(tilt), -depth * 0.05 * Math.cos(tilt)]
  const surfaceFront: Point = [0, surfaceCenter[1] + surfaceDepth * 0.5 * Math.sin(tilt), surfaceCenter[2] + surfaceDepth * 0.5 * Math.cos(tilt)]
  const seatRodAt = (insetRatio: number) => {
    const inset = surfaceDepth * insetRatio
    const start: Point = [-width / 2, surfaceFront[1] - inset * Math.sin(tilt) - 0.018 * Math.cos(tilt), surfaceFront[2] - inset * Math.cos(tilt) + 0.018 * Math.sin(tilt)]
    const end: Point = [width / 2, start[1], start[2]]
    return {
      start,
      control: [0, start[1] - 0.04, start[2]] as Point,
      end,
      radius: 0.009,
    }
  }
  const seatRods = [seatRodAt(0.25), seatRodAt(0.7)]
  const lowerSpacing = width * 0.85
  const upperLeft: Point = [-width / 2, seatForward[1], seatForward[2]]
  const upperRight: Point = [width / 2, seatForward[1], seatForward[2]]
  const lowerY = 0.065
  const lowerZ = upperLeft[2] + (upperLeft[1] - lowerY) / Math.tan(radians(FRONT_FRAME_ANGLE_DEGREES))
  const lowerLeft: Point = [-lowerSpacing / 2, lowerY, lowerZ]
  const lowerRight: Point = [lowerSpacing / 2, lowerY, lowerZ]
  const interpolate = (lower: Point, upper: Point, fraction: number): Point => lower.map((value, axis) => value + (upper[axis] - value) * fraction) as Point
  const frontFrame = {
    upperSpacing: width,
    lowerSpacing,
    upperLeft,
    upperRight,
    lowerLeft,
    lowerRight,
    seatRods,
    crossbar: { start: lowerLeft, end: lowerRight, radius: 0.009 },
  }
  const footrestSlope = radians(config.footrestSlope)
  const footrestThickness = 0.01
  const footrestDepth = 0.12
  const footrestWidth = lowerSpacing - 0.07
  const footrestCenter: Point = [0, config.footrestHeight / 100 + footrestDepth / 2 * Math.sin(footrestSlope) + footrestThickness / 2 * Math.cos(footrestSlope), frontFrame.lowerLeft[2] - 0.04]
  const footrest = {
    angle: footrestSlope,
    thickness: footrestThickness,
    center: footrestCenter,
    width: footrestWidth,
    depth: footrestDepth,
    supports: ([-1, 1] as const).map(side => {
      const x = side * (footrestWidth / 2 - 0.012)
      return [
        [x, frontFrame.crossbar.start[1], frontFrame.crossbar.start[2]] as Point,
        [x, footrestCenter[1] - 0.04 * Math.sin(footrestSlope) - footrestThickness / 2 * Math.cos(footrestSlope), footrestCenter[2] - 0.04 * Math.cos(footrestSlope) + footrestThickness / 2 * Math.sin(footrestSlope)] as Point,
      ] as [Point, Point]
    }),
  }
  const backAngle = tilt + radians(config.backrestAngle + (8 - config.backrestAngle) * foldProgress)
  const backTop: Point = [0, rear[1] + config.backrestHeight / 100 * Math.sin(backAngle), rear[2] + config.backrestHeight / 100 * Math.cos(backAngle)]
  const backrestSupports = ([-1, 1] as const).map(side => ({
    base: [side * width / 2, seatRear[1], seatRear[2]] as Point,
    top: [side * width / 2, backTop[1], backTop[2]] as Point,
  }))
  const rearWheelHeight = (WHEEL.rearRadius + WHEEL.rearTire) * Math.cos(camber)
  const wheelOffset = width / 2 + 0.065
  const axleZ = rear[2] + config.rearAxlePosition / 100
  const rearWheels = ([-1, 1] as const).map(side => ({
    center: [side * wheelOffset, rearWheelHeight, axleZ] as Point,
    camber: side * camber,
  }))
  const axleTube = {
    start: [-wheelOffset, rearWheelHeight, axleZ] as Point,
    end: [wheelOffset, rearWheelHeight, axleZ] as Point,
  }
  const frameOffset = width / 2 + 0.022
  const rearFrameConnections = ([-1, 1] as const).map(side => ({
    seatPoint: [side * width / 2, seatRear[1], seatRear[2]] as Point,
    axlePoint: [side * frameOffset, rearWheelHeight, axleZ] as Point,
  }))
  const rearFrameMidConnections = rearFrameConnections.map((connection, index) => {
    const side = index === 0 ? -1 : 1
    return {
      seatPoint: [side * (width / 2 + 0.005), (upperLeft[1] + seatRear[1]) / 2, (upperLeft[2] + seatRear[2]) / 2] as Point,
      axlePoint: connection.axlePoint,
    }
  })
  const casters = ([-1, 1] as const).map(side => {
    const center: Point = [side * (width / 2 + 0.025), WHEEL.casterRadius + WHEEL.casterTire, front[2] + 0.1]
    const forkAttachment = interpolate(side < 0 ? lowerLeft : lowerRight, side < 0 ? upperLeft : upperRight, 0.25)
    const forkHalfWidth = 0.025
    const topY = center[1] + WHEEL.casterRadius + WHEEL.casterTire + 0.008
    const forkTop: Point = [center[0], topY, center[2]]
    const leftAxle: Point = [center[0] - forkHalfWidth, center[1], center[2]]
    const rightAxle: Point = [center[0] + forkHalfWidth, center[1], center[2]]
    const forkAxle: [Point, Point] = [leftAxle, rightAxle]
    const forkLegs: [[Point, Point], [Point, Point]] = [
      [[leftAxle[0], topY, center[2]], leftAxle],
      [[rightAxle[0], topY, center[2]], rightAxle],
    ]
    const forkStem: [Point, Point] = [forkAttachment, forkTop]
    return { center, forkAttachment, forkTop, forkLegs, forkAxle, forkStem }
  })
  return {
    seat: { front, rear, seatForward, seatRear, surfaceCenter, surfaceFront, surfaceDepth, width, depth, tilt },
    frontFrame,
    footrest,
    backrest: { base: rear, top: backTop, supports: backrestSupports, height: config.backrestHeight / 100, angle: backAngle },
    rearWheels,
    axleTube,
    rearFrameConnections,
    rearFrameMidConnections,
    rearAxlePosition: config.rearAxlePosition / 100,
    casters,
  }
}
