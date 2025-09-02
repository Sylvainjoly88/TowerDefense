/**
 * Petit écran "placeholder" réutilisable pour les sections non encore développées.
 */
type Props = { title: string; onBack: () => void };

export default function Placeholder({ title, onBack }: Props) {
  return (
    <div className="screen center">
      <h2 className="title">{title}</h2>
      <div className="panel">
        <p>Section en construction. Reviens très vite !</p>
        <button className="btn" onClick={onBack}>⬅ Retour</button>
      </div>
    </div>
  );
}
