type Props = {
  onStartGame?: () => void;
  onOpenPlaceholder?: () => void;
};

export default function Menu({ onStartGame, onOpenPlaceholder }: Props) {
  return (
    <div className="menu">
      <h1>Tower Defense</h1>
      <button onClick={onStartGame}>Démarrer</button>
      <button onClick={onOpenPlaceholder}>Placeholder</button>
    </div>
  );
}