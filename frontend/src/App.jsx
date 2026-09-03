import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import CustomerList from './pages/CustomerList';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><ProductList /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
        <Route path="/invoices/new" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
        <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomerList /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}