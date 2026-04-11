export default function StatCard({ stat }) {
  return (
    <div className="stat-card">
      <h3>{stat.value}</h3>
      <p>{stat.label}</p>
    </div>
  );
}
