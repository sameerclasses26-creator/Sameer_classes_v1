export default function Spinner({ message = "Loading..." }) {
  return (
    <div className="app-loading">
      <div className="app-spinner" role="status" aria-live="polite" />
      <p>{message}</p>
    </div>
  );
}
