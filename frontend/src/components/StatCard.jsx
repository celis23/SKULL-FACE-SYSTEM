export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className={`stat-card${accent ? ` stat-card-${accent}` : ''}`}>
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}
