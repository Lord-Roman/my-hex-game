import type { AxialCoordinates, PixelCoordinates } from '../types/axialTypes'

export function generateHexagonCoordinates(radius: number): AxialCoordinates[] {
  const hexagons: AxialCoordinates[] = []
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      hexagons.push({ q, r })
    }
  }
  return hexagons
}

export function axialToPixel(
  { q, r }: AxialCoordinates,
  radius: number,
  center: PixelCoordinates,
): PixelCoordinates {
  const horizontalSpacing = radius * Math.sqrt(3)
  const verticalSpacing = radius * 2 * 0.75

  return {
    x: center.x + horizontalSpacing * (q + r * 0.5),
    y: center.y + verticalSpacing * r,
  }
}
