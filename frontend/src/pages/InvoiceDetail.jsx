import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    api.get(`/invoices/${id}`).then((res) => setInvoice(res.data));
  }, [id]);

  if (!invoice) return <p>Loading...</p>;

  return (
    <div>
      <h2>Invoice {invoice.invoice_number}</h2>
      <p>Status: {invoice.status}</p>
      <table border="1" cellPadding="6">
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.unit_price}</td>
              <td>₹{item.line_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Subtotal: ₹{invoice.subtotal}</p>
      <p>Tax ({invoice.tax_percent}%): ₹{invoice.tax_amount}</p>
      <p>Discount ({invoice.discount_percent}%): ₹{invoice.discount_amount}</p>
      <p><b>Grand Total: ₹{invoice.grand_total}</b></p>
    </div>
  );
}