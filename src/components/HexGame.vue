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
      const hexRadius = 40
      const hexWidth = hexRadius * Math.sqrt(3)
      const hexHeight = hexRadius * 2

      const cols = 8
      const rows = 6
      const offsetX = 50
      const offsetY = 50

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * hexWidth + ((row % 2) * hexWidth) / 2
          const y = row * (hexHeight * 0.75)

          const hex = this.add
            .image(x + offsetX, y + offsetY, 'hex')
            .setDisplaySize(hexWidth, hexHeight)
            .setDataEnabled()

          // Инициализация данных
          hex.data.set('value', 1)

          // Добавляем физическое тело
          this.physics.add.existing(hex, true)
          const body = hex.body as Phaser.Physics.Arcade.Body
          body.setCircle(hexRadius * 0.85, hexWidth / 2 - hexRadius, hexHeight / 2 - hexRadius)

          // Настройка интерактивности после создания тела
          hex.setInteractive({ pixelPerfect: true })

          // Обработчик клика с защитой от NaN
          hex.on('pointerdown', () => {
            const value = Number(hex.data.get('value')) || 1
            grassCount.value += value
            hex.setTint(0x88ff88)
            this.time.delayedCall(200, () => hex.clearTint())
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
