import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit_price: '', quantity: '', low_stock_threshold: 5 });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    const res = await api.get(`/products?search=${search}`);
    setProducts(res.data.data);
  };

  useEffect(() => { loadProducts(); }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/products/${editingId}`, form);
    } else {
      await api.post('/products', form);
    }
    setForm({ name: '', sku: '', category: '', unit_price: '', quantity: '', low_stock_threshold: 5 });
    setEditingId(null);
    loadProducts();
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${id}`);
      loadProducts();
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="unit_price" type="number" step="0.01" placeholder="Price" value={form.unit_price} onChange={handleChange} required />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <input name="low_stock_threshold" type="number" placeholder="Low stock alert level" value={form.low_stock_threshold} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update' : 'Add'} Product</button>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Qty</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ background: p.quantity <= p.low_stock_threshold ? '#ffe5e5' : 'white' }}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td>₹{p.unit_price}</td>
              <td>{p.quantity}{p.quantity <= p.low_stock_threshold ? ' ⚠️ Low Stock' : ''}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}