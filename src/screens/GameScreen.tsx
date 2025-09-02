// src/screens/GameScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { Game } from '../td/core/Game.ts';
import { createLevel } from '../td/state/Level.ts';
import type { GameState, TowerKind } from '../td/core/Types.ts';
import { spawnWave } from '../td/systems/Update.ts';

type Props = { onExit: () => void };

export default function GameScreen({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [mustPlace, setMustPlace] = useState(6); // nombre de tours obligatoires
  const [chooseAt, setChooseAt] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const level = createLevel(15, 36); // grille 15x15, cellule 36px
    const canvas = canvasRef.current!;
    canvas.width = level.gridSize * level.cellSize;
    canvas.height = canvas.width;
    const ctx = canvas.getContext('2d')!;
    const game = new Game(ctx, level);
    game.start();
    setState(level);
    return () => game.stop();
  }, []);

  // Lancer automatiquement la vague après placement des 6 tours
  useEffect(() => {
    if (!state) return;
    if (mustPlace === 0 && state.wave === 0) {
      spawnWave(state);
    }
  }, [mustPlace, state]);

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!state) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / state.cellSize);
    const y = Math.floor((e.clientY - rect.top) / state.cellSize);
    // on n'autorise le placement que sur l'herbe
    if (state.grid[y]?.[x] !== 'grass') return;
    setChooseAt({ x, y });
  }

  function placeTower(kind: TowerKind) {
    if (!state || !chooseAt) return;
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
    setMustPlace((n) => Math.max(0, n - 1));
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn" onClick={onExit}>⬅ Menu</button>
        <div className="stat">❤️ {state?.life ?? 0}</div>
        <div className="stat">🪙 {state?.gold ?? 0}</div>
        <div className="stat">Wave {state?.wave ?? 0}</div>
        <button
          className="btn"
          onClick={() => state && spawnWave(state)}
          disabled={mustPlace > 0}
          title={mustPlace > 0 ? `Place encore ${mustPlace} tours` : 'Lancer une vague'}
        >
          Next Wave
        </button>
      </div>

      <div className="playarea">
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="board"
          aria-label="zone de jeu"
        />
        <div className="side">
          <div className="panel">
            <h3>Détails</h3>
            <p>Place {mustPlace} tour(s) pour commencer.</p>
            <p>Clique sur l’herbe pour ouvrir le choix de tour.</p>
          </div>
        </div>
      </div>

      {chooseAt && (
        <div className="modal">
          <div className="modal-card">
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
