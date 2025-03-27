import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig.ts'

export function initializeGame(parent: string, onHexClick: (value: number) => void): Phaser.Game {
  gameConfig.parent = parent
  const game = new Phaser.Game(gameConfig)

  game.events.on('hexclick', (value: number) => {
    onHexClick(value)
  })

  return game
}
