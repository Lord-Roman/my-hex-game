<template>
  <div class="game-container">
    <div id="game-canvas"></div>
    <div class="resources-counter">Трава: {{ grassCount }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Phaser from 'phaser'

interface HexData {
  value: number
}

const grassCount = ref<number>(0)

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
      const hexRadius = 40 // Радиус шестиугольника (расстояние от центра до вершины)
      const hexWidth = hexRadius * Math.sqrt(3) // Ширина шестиугольника
      const hexHeight = hexRadius * 2 // Высота шестиугольника

      const cols = 8
      const rows = 6

      const offsetX = 50
      const offsetY = 50

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Правильное расположение без зазоров
          const x = col * hexWidth + ((row % 2) * hexWidth) / 2
          const y = row * ((hexHeight * 3) / 4) // 3/4 высоты для смещения

          const hex = this.add
            .image(x + offsetX, y + offsetY, 'hex')
            .setInteractive()
            .setDisplaySize(hexWidth, hexHeight) // Важно: задаём точный размер
            .setDataEnabled()

          const hexData: HexData = {
            value: 1,
          }

          Object.entries(hexData).forEach(([key, value]) => {
            hex.data.set(key, value)
          })

          hex.on('pointerdown', () => {
            const data = hex.data.getAll() as HexData
            grassCount.value += data.value
            hex.setTint(0x88ff88)
            setTimeout(() => hex.clearTint(), 200)
          })
        }
      }
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
        debug: true,
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
