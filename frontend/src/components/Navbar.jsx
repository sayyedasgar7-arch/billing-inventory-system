import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav>
      <Link to="/">Products</Link>
      <Link to="/invoices">Invoices</Link>
      <Link to="/invoices/new">New Invoice</Link>
      <Link to="/customers">Customers</Link>
      <span>Hi, {user.name}</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}