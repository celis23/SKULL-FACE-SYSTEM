export default function Navbar({ title, subtitle }) {
  return (
    <header className="navbar">
      <div>
        <h2 className="navbar-title">{title}</h2>
        {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
