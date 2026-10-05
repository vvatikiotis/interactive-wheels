export interface WheelchairConfig {
  seatWidth: number
  seatDepth: number
  wheelCamber: number
  rearAxlePosition: number
  backrestHeight: number
  backrestAngle: number
  seatAngle: number
}

export type Point = [number, number, number]

export const DEFAULT_CONFIG: WheelchairConfig = {
  seatWidth: 39,
  seatDepth: 40,
  wheelCamber: 2,
  rearAxlePosition: 8,
  backrestHeight: 10,
  backrestAngle: 95,
  seatAngle: 6,
}

const radians = (degrees: number) => degrees * Math.PI / 180

export const WHEEL = { rearRadius: 0.295, rearTire: 0.01, casterRadius: 0.045, casterTire: 0.005 }

export function deriveGeometry(config: WheelchairConfig) {
  const width = config.seatWidth / 100
  const depth = config.seatDepth / 100
  const tilt = radians(config.seatAngle)
  const camber = radians(config.wheelCamber)
  const front: Point = [0, 0.5, depth * Math.cos(tilt) / 2]
  const rear: Point = [0, 0.5 - depth * Math.sin(tilt), -depth * Math.cos(tilt) / 2]
  const seatForward = [0, front[1] - 0.009 * Math.cos(tilt), front[2] + 0.009 * Math.sin(tilt)] as Point
  const seatRear = [0, rear[1], rear[2]] as Point
  const lowerSpacing = width * 0.85
  const upperLeft: Point = [-width / 2, front[1] - 0.009 * Math.cos(tilt), front[2] + 0.009 * Math.sin(tilt)]
  const upperRight: Point = [width / 2, front[1] - 0.009 * Math.cos(tilt), front[2] + 0.009 * Math.sin(tilt)]
  const lowerLeft: Point = [-lowerSpacing / 2, 0.065, front[2] + 0.3]
  const lowerRight: Point = [lowerSpacing / 2, 0.065, front[2] + 0.3]
  const interpolate = (lower: Point, upper: Point, fraction: number): Point => lower.map((value, axis) => value + (upper[axis] - value) * fraction) as Point
  const frontFrame = {
    upperSpacing: width,
    lowerSpacing,
    upperLeft,
    upperRight,
    lowerLeft,
    lowerRight,
  }
  const footrest = {
    center: [0, frontFrame.lowerLeft[1] + 0.02 + 0.009, frontFrame.lowerLeft[2] - 0.03] as Point,
    width: lowerSpacing - 0.07,
    depth: 0.12,
  }
  const backAngle = tilt + radians(config.backrestAngle)
  const backTop: Point = [0, rear[1] + config.backrestHeight / 100 * Math.sin(backAngle), rear[2] + config.backrestHeight / 100 * Math.cos(backAngle)]
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
  const casters = ([-1, 1] as const).map(side => ({
    center: [side * (width / 2 + 0.025), WHEEL.casterRadius + WHEEL.casterTire, front[2] + 0.1] as Point,
    forkAttachment: interpolate(side < 0 ? lowerLeft : lowerRight, side < 0 ? upperLeft : upperRight, 0.25),
  }))
  return {
    seat: { front, rear, seatForward, seatRear, width, depth, tilt },
    frontFrame,
    footrest,
    backrest: { base: rear, top: backTop, height: config.backrestHeight / 100, angle: backAngle },
    rearWheels,
    axleTube,
    rearAxlePosition: config.rearAxlePosition / 100,
    casters,
  }
}
