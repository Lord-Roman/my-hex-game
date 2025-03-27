<template>
  <div class="game-container">
    <div id="game-canvas"></div>
    <div class="resources-counter">Трава: {{ grassCount }}</div>
  </div>
</template>

<script setup lang="ts">
import { initializeGame } from '@/game/game'
import { ref, onMounted } from 'vue'

const grassCount = ref(0)

onMounted(() => {
  initializeGame('game-canvas', (value: number) => {
    grassCount.value += value
  })
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
