export class GameState {
  // Конфигурация гексов
  public static readonly HEX_RADIUS = 40
  public static readonly HEX_WIDTH = GameState.HEX_RADIUS * Math.sqrt(3)
  public static readonly HEX_HEIGHT = GameState.HEX_RADIUS * 1.5

  // Состояние камеры
  public static isDragging = false
  public static dragStartPosition = { x: 0, y: 0 }

  // Конфигурация мира
  public static readonly MAP_RADIUS = 10
}
