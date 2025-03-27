import Phaser from 'phaser'

import type { AxialCoordinates } from '@/game/types/axialTypes'

export class Hex {
  public sprite: Phaser.GameObjects.Image | undefined
  public physicsBody: Phaser.Physics.Arcade.Body | undefined
  public text: Phaser.GameObjects.Text | undefined
  public value = 1

  constructor(
    private scene: Phaser.Scene,
    public readonly coordinates: AxialCoordinates,
    public readonly id: number,
    x: number,
    y: number,
    radius: number,
    private onClickCallback: (value: number) => void,
  ) {
    this.createSprite(x, y, radius)
    this.createPhysics(radius)
    this.createText(x, y)
    this.setupInteractivity()
  }

  private createSprite(x: number, y: number, radius: number): void {
    this.sprite = this.scene.add
      .image(x, y, 'hex')
      .setDisplaySize(radius * Math.sqrt(3), radius * 2)
  }

  private createPhysics(radius: number): void {
    if (!this.sprite) return
    this.scene.physics.add.existing(this.sprite, true)
    this.physicsBody = this.sprite.body as Phaser.Physics.Arcade.Body
    this.physicsBody.setCircle((radius * Math.sqrt(3)) / 2)
  }

  private createText(x: number, y: number): void {
    this.text = this.scene.add
      .text(x, y, `${this.id}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(1)
  }

  private setupInteractivity(): void {
    if (this.sprite) {
      this.sprite.setInteractive({ pixelPerfect: true }).on('pointerdown', () => {
        this.sprite?.setTint(0x88ff88)
        this.scene.time.delayedCall(200, () => this.sprite?.clearTint())
        this.onClickCallback(this.value)
      })
    }
  }
}
