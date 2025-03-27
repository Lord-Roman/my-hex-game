import Phaser from 'phaser'
import { GameState } from '@/game/core/GameState'

export function setupCameraControls(scene: Phaser.Scene): void {
  const camera = scene.cameras.main
  camera.setZoom(1)
  setCameraBounds(scene)

  // Зум
  scene.input.on(
    'wheel',
    (
      pointer: Phaser.Input.Pointer,
      gameObjects: Phaser.GameObjects.GameObject[],
      deltaX: number,
      deltaY: number,
    ) => {
      const zoomDelta = deltaY > 0 ? -0.2 : 0.2
      const newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2)
      camera.zoomTo(newZoom, 100)
    },
  )

  // Перемещение
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (pointer.leftButtonDown()) {
      GameState.isDragging = true
      GameState.dragStartPosition = {
        x: pointer.x + camera.scrollX,
        y: pointer.y + camera.scrollY,
      }
    }
  })

  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (GameState.isDragging) {
      camera.scrollX = GameState.dragStartPosition.x - pointer.x
      camera.scrollY = GameState.dragStartPosition.y - pointer.y
    }
  })

  scene.input.on('pointerup', () => {
    GameState.isDragging = false
  })
}

function setCameraBounds(scene: Phaser.Scene): void {
  scene.cameras.main.setBounds(
    -GameState.HEX_WIDTH * GameState.MAP_RADIUS,
    -GameState.HEX_HEIGHT * GameState.MAP_RADIUS,
    GameState.HEX_WIDTH * GameState.MAP_RADIUS * 3,
    GameState.HEX_HEIGHT * GameState.MAP_RADIUS * 3,
  )
}
