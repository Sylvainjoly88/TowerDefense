/**
 * Création d'un niveau "démo" :
 * - Grille carrée
 * - Chemin sinueux façon TD
 * - Valeurs de base pour l'or, la vie, etc.
 */
import type { GameState, Grid, Vec2 } from '../core/Types';

export function createLevel(gridSize = 15, cellSize = 36): GameState {
  // Grille initialisée en "herbe"
  const grid: Grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'grass'),
  );

  // Construction d'un chemin (suite de cellules)
  const pathCells: Vec2[] = [];
  const mid = Math.floor(gridSize / 2);

  // Zig-zag "simple", tu peux changer la forme à volonté
  for (let x = 0; x < gridSize; x++) pathCells.push({ x, y: mid + 2 });
  for (let y = mid + 2; y >= 4; y--) pathCells.push({ x: gridSize - 1, y });
  for (let x = gridSize - 1; x >= 2; x--) pathCells.push({ x, y: 4 });
  for (let y = 4; y <= gridSize - 5; y++) pathCells.push({ x: 2, y });
  for (let x = 2; x < gridSize - 2; x++) pathCells.push({ x, y: gridSize - 5 });

  // Marque le chemin dans la grille
  pathCells.forEach(({ x, y }) => (grid[y][x] = 'path'));

  // État initial du jeu
  return {
    gridSize,
    cellSize,
    grid,
    path: pathCells,
    enemies: [],
    towers: [],
    bullets: [],
    gold: 150,          // or de départ
    life: 10,           // points de vie
    wave: 0,            // aucune vague encore lancée
    lastTimestamp: 0,
    running: true,      // le jeu commence "en marche"
    timeScale: 1,       // vitesse normale
  };
}
