/**
 * Écran d'accueil simple avec 4 boutons.
 * Seul "Jouer" est actif pour le moment, les autres sont désactivés.
 */
type Props = {
  onPlay: () => void;
  onSearch: () => void;
  onEncyclo: () => void;
  onStats: () => void;
};

export default function Menu({ onPlay, onSearch, onEncyclo, onStats }: Props) {
  return (
    <div className="screen center">
      <h1 className="title">RPG-TD</h1>

      <div className="panel">
        {/* Lance le jeu */}
        <button className="btn primary" onClick={onPlay}>Jouer</button>

        {/* Boutons désactivés pour le futur */}
        <button className="btn" onClick={onSearch} disabled>Recherche (bientôt)</button>
        <button className="btn" onClick={onEncyclo} disabled>Encyclopédie (bientôt)</button>
        <button className="btn" onClick={onStats} disabled>Statistiques (bientôt)</button>
      </div>

      <p className="hint">Astuce : clique sur l’herbe pour poser une tour.</p>
    </div>
  );
}
