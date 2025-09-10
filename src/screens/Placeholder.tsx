type Props = {
  onExit?: () => void;
};

export default function Placeholder({ onExit }: Props) {
  return (
    <div className="placeholder">
      <p>Work in progress…</p>
      <button onClick={onExit}>Retour</button>
    </div>
  );
}