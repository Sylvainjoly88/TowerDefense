/**
 * Écran de jeu :
 * - Initialise un niveau (grille + chemin) et la boucle de jeu (classe Game)
 * - Affiche un HUD (vie/or/vague) + Pause/Play + vitesses (x1/x1.5/x2) + "Next Wave"
 * - Gère le placement des tours via un clic/touch sur le canvas > ouvre une modale (Mage/Combat)
 * - Imposer au démarrage le placement de 6 tours avant de lancer la première vague
 *
 * IMPORTANT ARCHI :
 * - La logique "temps réel" vit côté "systèmes" (update.ts) et est déclenchée par Game.ts
 *   qui tourne avec requestAnimationFrame. React N'EST PAS utilisé pour rendre chaque frame.
 * - React sert uniquement pour l'UI (HUD, modales, boutons) + événements utilisateur.
 */
import { useEffect, useRef, useState } from 'react';
import { Game } from '../td/core/Game';
import { createLevel } from '../td/state/Level';
import type { GameState, TowerKind } from '../td/core/Types';
import { spawnWave } from '../td/systems/Update';

// Propriétés reçues : onExit permet de revenir au menu
type Props = { onExit: () => void };

// Coûts des deux types de tours
const COSTS: Record<TowerKind, number> = { mage: 60, combat: 40 };

export default function GameScreen({ onExit }: Props) {
  // Référence vers l'élément <canvas> (dessin du jeu)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State React : on garde une référence au GameState (objet muté par la boucle)
  const [state, setState] = useState<GameState | null>(null);

  // Nombre de tours OBLIGATOIRES à poser au début avant la 1ère vague
  const [mustPlace, setMustPlace] = useState(6);

  // Si défini, affiche la modale de choix de tour sur la cellule {x,y}
  const [chooseAt, setChooseAt] = useState<{ x: number; y: number } | null>(null);

  // Petit message d'UI (ex: "Pas assez d'or", "Pause", "Vitesse x2")
  const [message, setMessage] = useState<string | null>(null);

  // Au montage : créer le niveau, configurer le canvas, démarrer la boucle de jeu.
  useEffect(() => {
    const level = createLevel(15, 36); // 15x15, chaque case = 36 px

    // Récupère le canvas et ajuste sa taille en pixels en fonction de la grille
    const canvas = canvasRef.current!;
    canvas.width = level.gridSize * level.cellSize;
    canvas.height = canvas.width;

    // Contexte 2D pour dessiner
    const ctx = canvas.getContext('2d')!;

    // Instancie et démarre la boucle (requestAnimationFrame)
    const game = new Game(ctx, level);
    game.start();

    // On garde le state pour piloter le HUD (vie/or/vague...) et les events
    setState(level);

    // Au démontage : arrête proprement la boucle
    return () => game.stop();
  }, []);

  // Dès que les 6 tours sont posées et qu'aucune vague n'a encore commencé,
  // on lance automatiquement la première vague pour "enchaîner" la partie.
  useEffect(() => {
    if (!state) return;
    if (mustPlace === 0 && state.wave === 0) {
      spawnWave(state);
    }
  }, [mustPlace, state]);

  /**
   * Convertit un clic (ou un touch) en coordonnées cellule (x,y) de la grille.
   * Si la case est de l'herbe, on ouvre la modale de choix de tour.
   */
  function handlePlaceRequest(clientX: number, clientY: number, target: HTMLCanvasElement) {
    if (!state) return;
    const rect = target.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / state.cellSize);
    const y = Math.floor((clientY - rect.top) / state.cellSize);
    // Interdit de poser sur le chemin
    if (state.grid[y]?.[x] !== 'grass') return;
    setChooseAt({ x, y });
  }

  // Gestion SOURIS
  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    handlePlaceRequest(e.clientX, e.clientY, e.currentTarget);
  }

  // Gestion TACTILE (mobile/tablette)
  function onCanvasTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    const t = e.changedTouches[0];
    if (!t) return;
    handlePlaceRequest(t.clientX, t.clientY, e.currentTarget);
  }

  /**
   * Pose une tour du type choisi si suffisamment d'or.
   * Les tours sont stockées dans state.towers et consommées par le système "update".
   * Note : on MODIFIE l'objet state (mutations), car la boucle utilise ce même objet.
   * React n'a pas besoin d'être re-rendu pour chaque frame.
   */
  function placeTower(kind: TowerKind) {
    if (!state || !chooseAt) return;

    const cost = COSTS[kind];
    if (state.gold < cost) {
      setMessage(`Pas assez d’or (coût ${cost})`);
      return;
    }

    // Débit d'or
    state.gold -= cost;

    // Ajout d'une tour avec des stats différentes selon le type
    state.towers.push({
      id: Date.now() + Math.random(),
      kind,
      cell: { x: chooseAt.x, y: chooseAt.y },
      range: kind === 'mage' ? 120 : 96,    // Mage = plus grande portée
      fireRate: kind === 'mage' ? 0.9 : 1.5, // Combat = cadence plus rapide
      damage: kind === 'mage' ? 35 : 20,
      lastShotAt: 0,
      level: 1,
    });

    // Ferme la modale et décrémente le compteur des tours obligatoires
    setChooseAt(null);
    setMustPlace((n) => Math.max(0, n - 1));
  }

  /** Met en pause / relance la boucle de jeu (consommé par update()). */
  function togglePause() {
    if (!state) return;
    state.running = !state.running;
    setMessage(state.running ? 'Lecture' : 'Pause');
  }

  /** Modifie le facteur de vitesse du temps (appliqué dans Game.ts). */
  function setSpeed(s: number) {
    if (!state) return;
    state.timeScale = s;
    setMessage(`Vitesse ×${s}`);
  }

  return (
    <div className="screen">
      {/* ----- HUD (barre du haut) ----- */}
      <div className="topbar">
        {/* Retour menu */}
        <button className="btn" onClick={onExit}>⬅ Menu</button>

        {/* Affichage d'infos live (les valeurs proviennent de state, muté par la boucle) */}
        <div className="stat">❤️ {state?.life ?? 0}</div>
        <div className="stat">🪙 {state?.gold ?? 0}</div>
        <div className="stat">Wave {state?.wave ?? 0}</div>

        <div className="spacer" />

        {/* Pause / Lecture */}
        <button className="btn" onClick={togglePause}>
          {state?.running ? '⏸ Pause' : '▶️ Play'}
        </button>

        {/* Choix de vitesse du jeu */}
        <div className="btn-group">
          <button className="btn" onClick={() => setSpeed(1)}>×1</button>
          <button className="btn" onClick={() => setSpeed(1.5)}>×1.5</button>
          <button className="btn" onClick={() => setSpeed(2)}>×2</button>
        </div>

        {/* Démarrer une nouvelle vague (désactivé tant que 6 tours non posées) */}
        <button
          className="btn primary"
          onClick={() => state && spawnWave(state)}
          disabled={mustPlace > 0}
          title={mustPlace > 0 ? `Place encore ${mustPlace} tours` : 'Lancer une vague'}
        >
          Next Wave
        </button>
      </div>

      {/* ----- Zone de jeu + colonne latérale ----- */}
      <div className="playarea">
        {/* Canvas = rendu du jeu (grille, chemins, tours, ennemis, projectiles) */}
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          onTouchStart={onCanvasTouch}
          className="board"
          aria-label="zone de jeu"
        />

        {/* Panneau d'aide / messages */}
        <div className="side">
          <div className="panel">
            <h3>Détails</h3>
            <p>Place {mustPlace} tour(s) pour commencer.</p>
            <p>Coûts — 🧙 Mage: {COSTS.mage} • 🛡️ Combat: {COSTS.combat}</p>
            <p>Clique/touche l’herbe pour ouvrir le choix.</p>
          </div>

          {message && (
            <div className="panel" role="status" aria-live="polite">
              {message}
              <button className="btn" onClick={() => setMessage(null)}>OK</button>
            </div>
          )}
        </div>
      </div>

      {/* ----- Modale choix de tour (s'affiche après clic sur l'herbe) ----- */}
      {chooseAt && (
        <div className="modal" onClick={() => setChooseAt(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">CHOISIR UNE TOUR</h3>

            <div className="tower-grid">
              <button className="tower-card" onClick={() => placeTower('mage')}>
                <div className="emoji">🧙‍♂️</div>
                <div className="label">Mage</div>
                <small>Coût {COSTS.mage} — Dégâts 35 • Portée ++ • Cadence −</small>
              </button>

              <button className="tower-card" onClick={() => placeTower('combat')}>
                <div className="emoji">🛡️</div>
                <div className="label">Combat</div>
                <small>Coût {COSTS.combat} — Dégâts 20 • Portée + • Cadence +</small>
              </button>
            </div>

            <button className="btn" onClick={() => setChooseAt(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
