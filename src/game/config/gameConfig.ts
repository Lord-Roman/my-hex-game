import { MainScene } from '@/scenes/MainScene'
import Phaser from 'phaser'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      // debug: false,
      debug: true,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [MainScene],
  input: {
    mouse: {
      target: null,
      preventDefaultWheel: false,
    },
  },
}
