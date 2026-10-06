import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, deriveGeometry, type WheelchairConfig } from './geometry'
import { deriveMannequin } from './mannequin'

const close = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 5)
const distance = (from: number[], to: number[]) => Math.hypot(...from.map((value, axis) => value - to[axis]))

describe('seated mannequin', () => {
  it('keeps its waist slightly narrower than the seat and feet above the footplate as settings change', () => {
    for (const config of [
      DEFAULT_CONFIG,
      { ...DEFAULT_CONFIG, seatWidth: 33, seatDepth: 46, seatAngle: 12, footrestSlope: 15, frontCrossbarHeight: 2 },
      { ...DEFAULT_CONFIG, seatWidth: 46, seatDepth: 36, seatAngle: 0, backrestAngle: 80, rearAxlePosition: 0, frontCrossbarHeight: 10 },
      { ...DEFAULT_CONFIG, seatDepth: 46, seatAngle: 12, backrestAngle: 110, rearAxlePosition: 12, frontCrossbarHeight: 10 },
    ]) {
      const chair = deriveGeometry(config)
      const figure = deriveMannequin(chair)
      expect(figure.hips[0][0]).toBeGreaterThan(-chair.seat.width / 2)
      expect(figure.hips[1][0]).toBeLessThan(chair.seat.width / 2)
      close(figure.hips[1][0] - figure.hips[0][0], chair.seat.width * 0.95)
      close(figure.shoulders[1][0] - figure.shoulders[0][0], chair.seat.width)
      expect(figure.shoulders[1][0] - figure.shoulders[0][0]).toBeGreaterThan(figure.hips[1][0] - figure.hips[0][0])
      expect(figure.hips[0][1]).toBeGreaterThan(chair.seat.rear[1])
      expect(figure.knees[0][2]).toBeGreaterThan(figure.hips[0][2])
      expect(figure.toes[0][1]).toBeGreaterThan(chair.footrest.center[1])
      expect(figure.toes[0][2]).toBeGreaterThan(chair.footrest.center[2])
      expect(figure.head.center[1]).toBeGreaterThan(figure.shoulders[0][1])
      for (const [index, side] of [-1, 1].entries()) {
        const arm = figure.arms[index]
        close(arm[0][0], figure.shoulders[index][0])
        close(arm[0][1], figure.shoulders[index][1])
        close(arm[0][2], figure.shoulders[index][2])
        expect(side * (arm[2][0] - arm[0][0])).toBeGreaterThan(0)
        expect(arm[0][1]).toBeGreaterThan(arm[1][1])
        expect(arm[1][1]).toBeGreaterThan(arm[2][1])
        close(arm[2][0] - arm[0][0], side * 0.1)
        close(arm[2][1] - arm[0][1], -0.45)
        close(arm[2][2], arm[0][2])
        close(distance(arm[0], arm[1]), 0.2465)
        close(distance(arm[1], arm[2]), 0.221)
      }
    }
  })

  it('keeps upper- and lower-arm lengths fixed throughout the adjustment ranges', () => {
    const ranges: [keyof WheelchairConfig, number, number][] = [
      ['seatWidth', 33, 46], ['seatDepth', 36, 46], ['wheelCamber', -4, 6],
      ['rearAxlePosition', 0, 12], ['backrestHeight', 10, 45], ['backrestAngle', 80, 110],
      ['backrestCurvature', 0, 10], ['seatAngle', 0, 12], ['footrestSlope', 0, 15], ['frontCrossbarHeight', 2, 10],
    ]
    for (let combination = 0; combination < 1024; combination++) {
      const config = { ...DEFAULT_CONFIG }
      ranges.forEach(([key, low, high], index) => { config[key] = combination & (1 << index) ? high : low })
      const figure = deriveMannequin(deriveGeometry(config))
      for (const [shoulder, elbow, hand] of figure.arms) {
        close(distance(shoulder, elbow), 0.2465)
        close(distance(elbow, hand), 0.221)
      }
    }
    const axleAtRear = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, rearAxlePosition: 0 }))
    const axleForward = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, rearAxlePosition: 12 }))
    for (const [index, arm] of axleAtRear.arms.entries()) {
      arm.forEach((point, pointIndex) => point.forEach((coordinate, axis) => close(coordinate, axleForward.arms[index][pointIndex][axis])))
    }
  })

  it('moves the mannequin upper body into the backrest cradle as curvature increases', () => {
    const flatChair = deriveGeometry({ ...DEFAULT_CONFIG, backrestCurvature: 0 })
    const curvedChair = deriveGeometry({ ...DEFAULT_CONFIG, backrestCurvature: 10 })
    const flat = deriveMannequin(flatChair)
    const curved = deriveMannequin(curvedChair)
    expect(curved.shoulderCenter[2]).toBeLessThan(flat.shoulderCenter[2])
    close(curved.shoulderCenter[1] - flat.shoulderCenter[1], 0.1 * Math.cos(flatChair.backrest.angle))
    close(curved.shoulderCenter[2] - flat.shoulderCenter[2], -0.1 * Math.sin(flatChair.backrest.angle))
  })

  it('leans with the configured backrest without changing the chair', () => {
    const upright = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 80 }))
    const reclined = deriveMannequin(deriveGeometry({ ...DEFAULT_CONFIG, backrestAngle: 110 }))
    expect(reclined.shoulders[0][2]).toBeLessThan(upright.shoulders[0][2])
    close(reclined.hips[0][2], upright.hips[0][2])
  })
})
