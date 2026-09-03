import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  const load = async () => setInvoices((await api.get('/invoices')).data);
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this invoice? Stock will be restored.')) {
      await api.put(`/invoices/${id}`, { status: 'cancelled' });
      load();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this invoice record?')) {
      await api.delete(`/invoices/${id}`);
      load();
    }
  };

  return (
    <div>
      <h2>Invoices</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Invoice #</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td><Link to={`/invoices/${inv.id}`}>{inv.invoice_number}</Link></td>
              <td>{inv.customer_name || 'Walk-in'}</td>
              <td>₹{inv.grand_total}</td>
              <td>{inv.status}</td>
              <td>
                {inv.status === 'active' && <button onClick={() => handleCancel(inv.id)}>Cancel</button>}
                <button onClick={() => handleDelete(inv.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}