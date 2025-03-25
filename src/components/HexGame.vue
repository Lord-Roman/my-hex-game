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

      // 3. Отрисовка границ
      this.drawHexagonBorder(hexagons, mapRadius, hexRadius, center)
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
    private axialToPixel(
      q: number,
      r: number,
      hexRadius: number,
      center: { x: number; y: number },
    ): { x: number; y: number } {
      const x = hexRadius * Math.sqrt(3) * (q + r / 2) + center.x
      const y = hexRadius * (3 / 2) * r + center.y
      return { x, y }
    }

    // Создание одного гекса
    private createHex(x: number, y: number, hexRadius: number): void {
      const hex = this.add
        .image(x, y, 'hex')
        .setDisplaySize(hexRadius * 2, hexRadius * 2)
        .setDataEnabled()

      // Настройка физики
      this.physics.add.existing(hex, true)
      const body = hex.body as Phaser.Physics.Arcade.Body
      body.setCircle(hexRadius * 0.85)

      // Настройка интерактивности
      hex.setInteractive({ pixelPerfect: true })
      hex.data.set('value', 1)

      // Обработчик клика
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

    // Отрисовка границы игрового поля
    private drawHexagonBorder(
      hexagons: { q: number; r: number }[],
      mapRadius: number,
      hexRadius: number,
      center: { x: number; y: number },
    ): void {
      const graphics = this.add.graphics({ lineStyle: { width: 3, color: 0xff0000 } })

      // Выбор крайних гексов
      const edgeHexes = hexagons.filter(({ q, r }) => {
        const s = -q - r
        return Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) === mapRadius
      })

      // Преобразование и сортировка точек
      const points = edgeHexes
        .map(({ q, r }) => this.axialToPixel(q, r, hexRadius, center))
        .sort((a, b) => {
          const angleA = Math.atan2(a.y - center.y, a.x - center.x)
          const angleB = Math.atan2(b.y - center.y, b.x - center.x)
          return angleA - angleB
        })

      // Замыкание контура
      points.push(points[0])
      graphics.strokePoints(points)
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
        debug: false, // Можно отключить после отладки
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
