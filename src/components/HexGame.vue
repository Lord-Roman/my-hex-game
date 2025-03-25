<template>
  <div class="game-container">
    <div id="game-canvas"></div>
    <div class="resources-counter">Трава: {{ grassCount }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Phaser from 'phaser'

const grassCount = ref(0)

onMounted(() => {
  class MainScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MainScene' })
    }

    preload() {
      this.load.image(
        'hex',
        'data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="86" height="100" viewBox="0 0 86 100"><polygon points="43,0 86,25 86,75 43,100 0,75 0,25" fill="%2366aa66" stroke="%23333" stroke-width="2"/></svg>',
      )
    }

    create() {
      this.createHexGrid()
    }

    private createHexGrid(): void {
      // Основные настройки
      const hexRadius = 40
      const mapRadius = 3
      const center = { x: 400, y: 300 }

      // 1. Генерация координат
      const hexagons = this.generateHexagonCoordinates(mapRadius)

      // 2. Создание гексов
      hexagons.forEach(({ q, r }) => {
        const position = this.axialToPixel(q, r, hexRadius, center)
        this.createHex(position.x, position.y, hexRadius)
      })
    }

    // Генерация координат в осевой системе
    private generateHexagonCoordinates(mapRadius: number): { q: number; r: number }[] {
      const hexagons: { q: number; r: number }[] = []

      for (let q = -mapRadius; q <= mapRadius; q++) {
        const r1 = Math.max(-mapRadius, -q - mapRadius)
        const r2 = Math.min(mapRadius, -q + mapRadius)
        for (let r = r1; r <= r2; r++) {
          hexagons.push({ q, r })
        }
      }
      return hexagons
    }

    // Преобразование координат
    // В классе MainScene:
    private axialToPixel(
      q: number,
      r: number,
      hexRadius: number,
      center: { x: number; y: number },
    ): { x: number; y: number } {
      // Реальные пропорции из SVG (86x100)
      const aspectRatio = 86 / 100 // 0.86
      const hexWidth = hexRadius * 2 * aspectRatio // Ширина гекса
      const hexHeight = hexRadius * 2 // Высота гекса

      // Правильное расстояние между центрами
      const horizontalSpacing = hexWidth // Эмпирическая корректировка
      const verticalSpacing = hexHeight * 0.75

      const x = horizontalSpacing * (q + r * 0.5) + center.x
      const y = verticalSpacing * r + center.y
      return { x, y }
    }

    private createHex(x: number, y: number, hexRadius: number): void {
      // Размеры согласно SVG
      const displayWidth = hexRadius * 2 * (86 / 100)
      const displayHeight = hexRadius * 2

      const hex = this.add
        .image(x, y, 'hex')
        .setDisplaySize(displayWidth, displayHeight)
        .setDataEnabled()

      // Физическое тело с коррекцией
      this.physics.add.existing(hex, true)
      const body = hex.body as Phaser.Physics.Arcade.Body
      body.setCircle(displayWidth / 2)

      // const bodyRadius = displayWidth / 2
      // body.setCircle(
      //   bodyRadius,
      //   (displayWidth - displayHeight) / 2, // Центрирование по X не работает
      //   0, // Центрирование по Y не работает
      // )

      hex.setInteractive({
        pixelPerfect: true,
        useHandCursor: true,
      })
      hex.data.set('value', 1)

      hex.on('pointerdown', () => {
        this.handleHexClick(hex)
      })
    }

    // Обработка клика на гексе
    private handleHexClick(hex: Phaser.GameObjects.Image): void {
      const value = hex.data.get('value') as number
      grassCount.value += value
      hex.setTint(0x88ff88)
      this.time.delayedCall(200, () => hex.clearTint())
    }
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    physics: {
      default: 'arcade',
      arcade: {
        debug: true, // Можно отключить после отладки
        gravity: { x: 0, y: 0 },
      },
    },
    scene: [MainScene],
  }

  new Phaser.Game(config)
})
</script>

<style scoped>
.game-container {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 0 auto;
}

#game-canvas {
  width: 100%;
  height: 100%;
}

.resources-counter {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
  font-size: 18px;
}
</style>
