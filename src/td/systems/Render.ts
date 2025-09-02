/**
 * Rendu Canvas 2D (supporte grilles rectangulaires).
 * Affiche aussi : Départ (vert) et Arrivée (rouge) selon state.path[0]/state.path[last].
 */
import type { GameState } from '../core/Types';

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  const cols = state.gridSize;
  const rows = state.grid.length;
  const w = cols * state.cellSize;
  const h = rows * state.cellSize;

  ctx.clearRect(0, 0, w, h);

  // fond
  ctx.fillStyle = '#74b26a';
  ctx.fillRect(0, 0, w, h);

  // grille + chemin
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (state.grid[y][x] === 'path') {
        ctx.fillStyle = '#e2c26a';
        ctx.fillRect(x * state.cellSize, y * state.cellSize, state.cellSize, state.cellSize);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.strokeRect(x * state.cellSize, y * state.cellSize, state.cellSize, state.cellSize);
    }
  }

  // Marqueurs départ / arrivée
  if (state.path.length > 0) {
    const start = state.path[0];
    const end = state.path[state.path.length - 1];
    const cx = (c: number) => c * state.cellSize + state.cellSize / 2;
    const cy = (r: number) => r * state.cellSize + state.cellSize / 2;

    // Départ (vert)
    ctx.beginPath();
    ctx.arc(cx(start.x), cy(start.y), state.cellSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();

    // Arrivée (rouge foncé)
    ctx.beginPath();
    ctx.arc(cx(end.x), cy(end.y), state.cellSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
  }

  // Tours
  for (const t of state.towers) {
    const cx = t.cell.x * state.cellSize + state.cellSize / 2;
    const cy = t.cell.y * state.cellSize + state.cellSize / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, state.cellSize * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = t.kind === 'mage' ? '#4d6bdc' : '#6b574a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy - state.cellSize * 0.22, state.cellSize * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = t.kind === 'mage' ? '#ffd34e' : '#3b8f2e';
    ctx.fill();
  }

  // Ennemis + PV
  for (const e of state.enemies) {
    ctx.fillStyle = '#c0463c';
    ctx.beginPath();
    ctx.arc(e.pos.x, e.pos.y, state.cellSize * 0.22, 0, Math.PI * 2);
    ctx.fill();

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

  // Projectiles
  for (const b of state.bullets) {
    ctx.fillStyle = b.kind === 'mage' ? '#8dc5ff' : '#222';
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
