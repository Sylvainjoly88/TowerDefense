// src/td/state/level.ts
import type { GameState, Grid, Vec2 } from '../core/Types';

export function createLevel(gridSize = 15, cellSize = 36): GameState {
  const grid: Grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'grass'),
  );

  // Chemin "doublé" sinueux façon TD
  const pathCells: Vec2[] = [];
  const mid = Math.floor(gridSize / 2);

  for (let x = 0; x < gridSize; x++) pathCells.push({ x, y: mid + 2 });
  for (let y = mid + 2; y >= 4; y--) pathCells.push({ x: gridSize - 1, y });
  for (let x = gridSize - 1; x >= 2; x--) pathCells.push({ x, y: 4 });
  for (let y = 4; y <= gridSize - 5; y++) pathCells.push({ x: 2, y });
  for (let x = 2; x < gridSize - 2; x++) pathCells.push({ x, y: gridSize - 5 });

  pathCells.forEach(({ x, y }) => (grid[y][x] = 'path'));

  return {
    gridSize,
    cellSize,
    grid,
    path: pathCells,
    enemies: [],
    towers: [],
    bullets: [],
    gold: 150,
    life: 10,
    wave: 0,
    lastTimestamp: 0,
    running: true,
  };
}
