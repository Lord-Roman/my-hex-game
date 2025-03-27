import Phaser from 'phaser'
import { Hex } from '@/game/entities/Hex'
import { setupCameraControls } from '@/game/utils/cameraUtils'
import { GameState } from '@/game/core/GameState'
import { axialToPixel, generateHexagonCoordinates } from '@/game/utils/axialUtils'

export class MainScene extends Phaser.Scene {
  private hexes: Hex[] = []

  constructor() {
    super({ key: 'MainScene' })
  }

  preload(): void {
    this.load.image(
      'hex',
      'data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="86" height="100" viewBox="0 0 86 100"><polygon points="43,0 86,25 86,75 43,100 0,75 0,25" fill="%2366aa66" stroke="%23333" stroke-width="2"/></svg>',
    )
  }

  create(): void {
    this.createSkyGradient()
    this.createHexGrid()
    setupCameraControls(this)
  }

  private createSkyGradient(): void {
    const gradient = this.add.graphics()
    const skyColor = Phaser.Display.Color.HexStringToColor('#87CEEB')
    const horizonColor = Phaser.Display.Color.HexStringToColor('#E0F6FF')

    gradient.fillGradientStyle(
      skyColor.color,
      skyColor.color,
      horizonColor.color,
      horizonColor.color,
      1,
    )
    gradient.fillRect(0, 0, 800, 600)
    gradient.setScrollFactor(0)
  }

  private createHexGrid(): void {
    const center = { x: 400, y: 300 }
    let hexCounter = 1

    generateHexagonCoordinates(GameState.MAP_RADIUS).forEach((coords) => {
      const pos = axialToPixel(coords, GameState.HEX_RADIUS, center)
      const hex = new Hex(
        this,
        coords,
        hexCounter++,
        pos.x,
        pos.y,
        GameState.HEX_RADIUS,
        (value: number) => this.game.events.emit('hexclick', value),
      )
      this.hexes.push(hex)
    })
  }
}
