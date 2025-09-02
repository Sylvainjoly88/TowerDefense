// src/screens/Menu.tsx
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
        <button className="btn primary" onClick={onPlay}>Jouer</button>
        <button className="btn" onClick={onSearch} disabled>Recherche (bientôt)</button>
        <button className="btn" onClick={onEncyclo} disabled>Encyclopédie (bientôt)</button>
        <button className="btn" onClick={onStats} disabled>Statistiques (bientôt)</button>
      </div>
      <p className="hint">Tip : clique sur l’herbe pour poser une tour.</p>
    </div>
  );
}
