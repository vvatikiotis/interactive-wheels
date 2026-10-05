export interface WheelchairConfig {
  seatWidth: number
  seatDepth: number
  wheelCamber: number
  backrestHeight: number
  backrestAngle: number
  seatAngle: number
}

export type Point = [number, number, number]

export const DEFAULT_CONFIG: WheelchairConfig = {
  seatWidth: 39,
  seatDepth: 40,
  wheelCamber: 2,
  backrestHeight: 35,
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
  const backAngle = tilt + radians(config.backrestAngle)
  const backTop: Point = [0, rear[1] + config.backrestHeight / 100 * Math.sin(backAngle), rear[2] + config.backrestHeight / 100 * Math.cos(backAngle)]
  const rearWheelHeight = WHEEL.rearRadius * Math.cos(camber) + WHEEL.rearTire
  const wheelOffset = width / 2 + 0.065 + WHEEL.rearRadius * Math.sin(camber)
  const rearWheels = ([-1, 1] as const).map(side => ({
    center: [side * wheelOffset, rearWheelHeight, rear[2] + 0.075] as Point,
    camber: side * camber,
  }))
  const casters = ([-1, 1] as const).map(side => ({
    center: [side * (width / 2 + 0.025), WHEEL.casterRadius + WHEEL.casterTire, front[2] + 0.1] as Point,
  }))
  return {
    seat: { front, rear, width, depth, tilt },
    backrest: { base: rear, top: backTop, height: config.backrestHeight / 100, angle: backAngle },
    rearWheels,
    casters,
  }
}
