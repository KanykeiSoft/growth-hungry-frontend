import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Welcome to Growth Hungry</h2>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
      <Link to="/register"><button className="btn-lg">Register</button></Link>
<Link to="/login"><button className="btn-lg">Login</button></Link>

<style>{`
  .btn-lg{
    padding:10px 16px;border-radius:10px;
    background:linear-gradient(180deg,#c69c6d,#a47848);
    border:1px solid #a47848;color:#fff;font-weight:700;cursor:pointer;
  }
  .btn-lg + .btn-lg{ margin-left:12px; }
`}</style>
      </div>
    </div>
  );
}
