/**
 * Écran de jeu — version "6 tours EXACTEMENT, gratuites".
 * Reçoit la carte choisie (shape/cols/rows) via les props.
 */

import { useEffect, useRef, useState } from 'react';
import { Game } from '../td/core/Game';
import { createLevel, type PathShape } from '../td/state/Level';   // ⚠️ Majuscule
import type { GameState, TowerKind } from '../td/core/Types';      // ⚠️ Majuscule
import { spawnWave } from '../td/systems/Update';                   // ⚠️ Majuscule

type Props = {
  onExit: () => void;
  shape: PathShape;
  cols: number;
  rows: number;
};

const REQUIRED_TOWERS = 6;

export default function GameScreen({ onExit, shape, cols, rows }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [mustPlace, setMustPlace] = useState(REQUIRED_TOWERS);
  const [chooseAt, setChooseAt] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Initialisation : crée le niveau selon la carte choisie
  useEffect(() => {
    const level = createLevel(cols, rows, 36, shape); // 👈 utilise la forme sélectionnée
    const canvas = canvasRef.current!;
    canvas.width = level.gridSize * level.cellSize;   // gridSize = largeur (cols)
    canvas.height = rows * level.cellSize;            // hauteur = rows * cellSize

    const ctx = canvas.getContext('2d')!;
    const game = new Game(ctx, level);
    game.start();

    setState(level);
    return () => game.stop();
  }, [shape, cols, rows]);

  useEffect(() => {
    if (!state) return;
    if (mustPlace === 0 && state.wave === 0) {
      spawnWave(state);
    }
  }, [mustPlace, state]);

  function hasTowerAt(x: number, y: number) {
    if (!state) return false;
    return state.towers.some((t) => t.cell.x === x && t.cell.y === y);
  }

  function handlePlaceRequest(clientX: number, clientY: number, target: HTMLCanvasElement) {
    if (!state) return;
    if (state.towers.length >= REQUIRED_TOWERS) {
      setMessage(`Limite de ${REQUIRED_TOWERS} tours atteinte`);
      return;
    }
    const rect = target.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / state.cellSize);
    const y = Math.floor((clientY - rect.top) / state.cellSize);

    if (state.grid[y]?.[x] !== 'grass') {
      setMessage('Impossible de poser sur le chemin');
      return;
    }
    if (hasTowerAt(x, y)) {
      setMessage('Il y a déjà une tour ici');
      return;
    }
    setChooseAt({ x, y });
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    handlePlaceRequest(e.clientX, e.clientY, e.currentTarget);
  }
  function onCanvasTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    const t = e.changedTouches[0];
    if (t) handlePlaceRequest(t.clientX, t.clientY, e.currentTarget);
  }

  function placeTower(kind: TowerKind) {
    if (!state || !chooseAt) return;
    if (state.towers.length >= REQUIRED_TOWERS) {
      setChooseAt(null);
      setMessage(`Limite de ${REQUIRED_TOWERS} tours atteinte`);
      return;
    }
    state.towers.push({
      id: Date.now() + Math.random(),
      kind,
      cell: { x: chooseAt.x, y: chooseAt.y },
      range: kind === 'mage' ? 120 : 96,
      fireRate: kind === 'mage' ? 0.9 : 1.5,
      damage: kind === 'mage' ? 35 : 20,
      lastShotAt: 0,
      level: 1,
    });
    setChooseAt(null);
    setMustPlace((left) => Math.max(0, left - 1));
  }

  function togglePause() {
    if (state) {
      state.running = !state.running;
      setMessage(state.running ? 'Lecture' : 'Pause');
    }
  }
  function setSpeed(s: number) {
    if (state) {
      state.timeScale = s;
      setMessage(`Vitesse ×${s}`);
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn" onClick={onExit}>⬅ Menu</button>
        <div className="stat">❤️ {state?.life ?? 0}</div>
        <div className="stat">Wave {state?.wave ?? 0}</div>
        <div className="spacer" />
        <button className="btn" onClick={togglePause}>
          {state?.running ? '⏸ Pause' : '▶️ Play'}
        </button>
        <div className="btn-group">
          <button className="btn" onClick={() => setSpeed(1)}>×1</button>
          <button className="btn" onClick={() => setSpeed(1.5)}>×1.5</button>
          <button className="btn" onClick={() => setSpeed(2)}>×2</button>
        </div>
        <button
          className="btn primary"
          onClick={() => state && spawnWave(state)}
          disabled={mustPlace > 0}
          title={mustPlace > 0 ? `Place encore ${mustPlace} tour(s)` : 'Lancer une vague'}
        >
          Next Wave
        </button>
      </div>

      <div className="playarea">
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          onTouchStart={onCanvasTouch}
          className="board"
          aria-label="zone de jeu"
        />
        <div className="side">
          <div className="panel">
            <h3>Détails</h3>
            {mustPlace > 0 ? (
              <>
                <p>Place {mustPlace} tour(s) pour commencer.</p>
                <p>Clique/touche une case d’herbe pour ouvrir le choix.</p>
              </>
            ) : (
              <p>Tu joues maintenant avec {REQUIRED_TOWERS} tours fixes.</p>
            )}
            <p>Carte : <code>{shape}</code> — {cols}×{rows}</p>
          </div>
          {message && (
            <div className="panel" role="status" aria-live="polite">
              {message}
              <button className="btn" onClick={() => setMessage(null)}>OK</button>
            </div>
          )}
        </div>
      </div>

      {chooseAt && (
        <div className="modal" onClick={() => setChooseAt(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">CHOISIR UNE TOUR</h3>
            <div className="tower-grid">
              <button className="tower-card" onClick={() => placeTower('mage')}>
                <div className="emoji">🧙‍♂️</div>
                <div className="label">Mage</div>
                <small>Dégâts 35 • Portée ++ • Cadence −</small>
              </button>
              <button className="tower-card" onClick={() => placeTower('combat')}>
                <div className="emoji">🛡️</div>
                <div className="label">Combat</div>
                <small>Dégâts 20 • Portée + • Cadence +</small>
              </button>
            </div>
            <button className="btn" onClick={() => setChooseAt(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
