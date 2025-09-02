/**
 * Écran de sélection de carte :
 * - Affiche une grille de "cartes" avec une miniature (canvas), un nom, et les dimensions.
 * - Quand on clique sur une carte, on appelle onPick(...) avec la forme choisie.
 *
 * Astuce : la miniature est dessinée via un petit canvas qui trace juste la grille
 *          et le chemin retourné par createLevel(..., shape).
 */

import { useEffect, useRef } from 'react';
import type { PathShape } from '../td/state/Level';
import { createLevel } from '../td/state/Level';

type MapDef = {
  id: PathShape;
  name: string;
  cols: number;
  rows: number;
};

type Props = {
  onBack: () => void;
  onPick: (shape: PathShape, cols: number, rows: number) => void;
};

const MAPS: MapDef[] = [
  { id: 'U',         name: 'Forme U',         cols: 15, rows: 20 },
  { id: 'S',         name: 'Forme S',         cols: 15, rows: 20 },
  { id: 'x-base',    name: 'X avec base',     cols: 15, rows: 20 },
  { id: 'aleatoire', name: 'Aléatoire',       cols: 15, rows: 20 },
];


/** Composant interne : dessine la miniature d'une carte sur un canvas. */
function MapPreview({ shape, cols, rows }: { shape: PathShape; cols: number; rows: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const W = 240;
    const H = Math.round((rows / cols) * W);
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d')!;
    const lvl = createLevel(cols, rows, 10, shape); // cellSize 10 pour l'échantillon
    const cellW = W / cols;
    const cellH = H / rows;

    ctx.fillStyle = '#74b26a';
    ctx.fillRect(0, 0, W, H);

    // Chemin
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (lvl.grid[y][x] === 'path') {
          ctx.fillStyle = '#e2c26a';
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
    }

    // Grille
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let x = 0; x <= cols; x++) {
      const xx = Math.round(x * cellW) + 0.5;
      ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, H); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      const yy = Math.round(y * cellH) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }

    // Marqueurs Départ/Arrivée
    if (lvl.path.length > 0) {
      const start = lvl.path[0];
      const end = lvl.path[lvl.path.length - 1];
      const cx = (c: number) => c * cellW + cellW / 2;
      const cy = (r: number) => r * cellH + cellH / 2;

      ctx.beginPath();
      ctx.arc(cx(start.x), cy(start.y), Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71'; // vert
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx(end.x), cy(end.y), Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#c0392b'; // rouge
      ctx.fill();
    }
  }, [shape, cols, rows]);

  return <canvas ref={ref} className="map-thumb" aria-hidden="true" />;
}


export default function SelectMap({ onBack, onPick }: Props) {
  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn" onClick={onBack}>⬅ Retour</button>
        <h2 style={{ marginLeft: 8 }}>Choisir une carte</h2>
      </div>

      {/* Grille de cartes */}
      <div className="map-grid">
        {MAPS.map((m) => (
          <button
            key={m.id}
            className="map-card"
            onClick={() => onPick(m.id, m.cols, m.rows)}
            title={`${m.name} — ${m.cols}×${m.rows}`}
          >
            <MapPreview shape={m.id} cols={m.cols} rows={m.rows} />
            <div className="map-meta">
              <div className="map-name">{m.name}</div>
              <div className="map-size">{m.cols} × {m.rows}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
