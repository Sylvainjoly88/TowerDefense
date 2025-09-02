// src/td/systems/render.ts
import type { GameState } from '../core/Types';

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  const w = state.gridSize * state.cellSize;
  const h = w;
  ctx.clearRect(0, 0, w, h);

  // fond
  ctx.fillStyle = '#74b26a';
  ctx.fillRect(0, 0, w, h);

  // grille + chemin
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      if (state.grid[y][x] === 'path') {
        ctx.fillStyle = '#e2c26a';
        ctx.fillRect(x * state.cellSize, y * state.cellSize, state.cellSize, state.cellSize);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.strokeRect(x * state.cellSize, y * state.cellSize, state.cellSize, state.cellSize);
    }
  }

  // tours
  for (const t of state.towers) {
    const cx = t.cell.x * state.cellSize + state.cellSize / 2;
    const cy = t.cell.y * state.cellSize + state.cellSize / 2;

    // portée
    ctx.beginPath();
    ctx.arc(cx, cy, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();

    // corps
    ctx.beginPath();
    ctx.arc(cx, cy, state.cellSize * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = t.kind === 'mage' ? '#4d6bdc' : '#6b574a';
    ctx.fill();

    // tête "chapeau"
    ctx.beginPath();
    ctx.arc(cx, cy - state.cellSize * 0.22, state.cellSize * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = t.kind === 'mage' ? '#ffd34e' : '#3b8f2e';
    ctx.fill();
  }

  // ennemis
  for (const e of state.enemies) {
    ctx.fillStyle = '#c0463c';
    ctx.beginPath();
    ctx.arc(e.pos.x, e.pos.y, state.cellSize * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // barre de vie
    const barW = state.cellSize * 0.6;
    const barH = 5;
    const px = e.pos.x - barW / 2;
    const py = e.pos.y - state.cellSize * 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px, py, barW, barH);
    ctx.fillStyle = '#7ee081';
    const ratio = Math.max(0, Math.min(1, e.life / 60));
    ctx.fillRect(px, py, barW * ratio, barH);
  }

  // projectiles
  for (const b of state.bullets) {
    ctx.fillStyle = b.kind === 'mage' ? '#8dc5ff' : '#222';
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
