import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function InvoiceForm() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data.data));
    api.get('/customers').then((res) => setCustomers(res.data));
  }, []);

  const addItem = () => setSelectedItems([...selectedItems, { product_id: '', quantity: 1 }]);

  const updateItem = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const removeItem = (index) => setSelectedItems(selectedItems.filter((_, i) => i !== index));

  const subtotal = selectedItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === Number(item.product_id));
    return sum + (product ? product.unit_price * item.quantity : 0);
  }, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/invoices', {
        customer_id: customerId || null,
        items: selectedItems,
        tax_percent: taxPercent,
        discount_percent: discountPercent
      });
      alert('Invoice created: ' + res.data.invoice_number);
      navigate('/invoices');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Invoice</h2>
      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">Walk-in Customer</option>
        {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selectedItems.map((item, i) => (
        <div key={i}>
          <select value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)} required>
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
          </select>
          <input
            type="number" min="1"
            value={item.quantity}
            onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
          />
          <button type="button" onClick={() => removeItem(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>+ Add Product</button>

      <div>
        <label>Tax %: <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} /></label>
        <label>Discount %: <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} /></label>
      </div>

      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
      <p>Tax: ₹{taxAmount.toFixed(2)}</p>
      <p>Discount: ₹{discountAmount.toFixed(2)}</p>
      <p><b>Grand Total: ₹{grandTotal.toFixed(2)}</b></p>

      <button type="submit" disabled={selectedItems.length === 0}>Create Invoice</button>
    </form>
  );
}