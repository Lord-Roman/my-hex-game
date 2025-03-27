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
    private cameraControls!: Phaser.Events.EventEmitter
    private isDragging = false
    private startDragX = 0
    private startDragY = 0
    private mapRadius = 10
    private HEX_RADIUS = 40
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
      this.createSkyGradient()
      this.createHexGrid()
      this.setupCameraControls()
    }

    private createSkyGradient(): void {
      const gradient = this.add.graphics()
      const skyColor = Phaser.Display.Color.HexStringToColor('#87CEEB') // Цвет неба
      const horizonColor = Phaser.Display.Color.HexStringToColor('#E0F6FF') // Цвет горизонта

      gradient.fillGradientStyle(
        skyColor.color, // Верхний левый
        skyColor.color, // Верхний правый
        horizonColor.color, // Нижний левый
        horizonColor.color, // Нижний правый
        1, // Альфа
      )

      gradient.fillRect(0, 0, 800, 600) // Размеры canvas
      gradient.setScrollFactor(0) // Фиксируем фон
    }

    private setupCameraControls(): void {
      const camera = this.cameras.main

      // 1. Устанавливаем границы камеры
      const bounds = this.calculateCameraBounds()
      camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height)

      // 2. Включение зума колесиком мыши
      camera.setZoom(1)
      this.input.on(
        'wheel',
        (pointer: unknown, gameObjects: unknown[], deltaX: number, deltaY: number) => {
          const zoomDelta = deltaY > 0 ? -0.2 : 0.2
          const newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 2)
          camera.zoomTo(newZoom, 100) // Плавный зум за 100ms
        },
      )

      // 3. Перемещение камеры при зажатой ЛКМ
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.startDragX = pointer.x + camera.scrollX
          this.startDragY = pointer.y + camera.scrollY
        }
      })

      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.isDragging = true
          camera.scrollX = this.startDragX - pointer.x
          camera.scrollY = this.startDragY - pointer.y
        }
      })

      this.input.on('pointerup', () => {
        this.isDragging = false
      })
    }

    private calculateCameraBounds(): { x: number; y: number; width: number; height: number } {
      // Рассчитываем размеры мира на основе mapRadius
      const hexSize = this.HEX_RADIUS * 2
      const width = hexSize * this.mapRadius * 3
      const height = hexSize * this.mapRadius * 2.5

      return {
        x: -width / 2,
        y: -height / 2,
        width: width,
        height: height,
      }
    }

    private createHexGrid(): void {
      // Основные настройки
      const center = { x: 400, y: 300 }

      // 1. Генерация координат
      const hexagons = this.generateHexagonCoordinates(this.mapRadius)

      // 2. Создание гексов
      let hexCounter = 1

      hexagons.forEach(({ q, r }) => {
        const position = this.axialToPixel(q, r, this.HEX_RADIUS, center)
        const hex = this.createHex(position.x, position.y, this.HEX_RADIUS)

        // Добавляем текст с номером
        this.add
          .text(position.x, position.y, `${hexCounter}`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
          })
          .setOrigin(0.5) // Центрирование текста
          .setScrollFactor(1) // Движется вместе с камерой

        hexCounter++
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

      hex.on('pointerup', () => {
        if (this.isDragging) return
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
    backgroundColor: '#000000',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { x: 0, y: 0 },
      },
    },
    input: {
      mouse: {
        target: document.getElementById('game-canvas') as HTMLElement,
        preventDefaultWheel: false,
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
