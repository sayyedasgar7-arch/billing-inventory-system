// pages/CustomerList.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const load = async () => setCustomers((await api.get('/customers')).data);

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // separate handler just for phone — keeps only digits, max 10
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, ''); // \D = "not a digit" — strips out letters/symbols as you type
    if (digitsOnly.length <= 10) {
      setForm({ ...form, phone: digitsOnly });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && form.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits');
      return; // stops the form from submitting if phone is incomplete
    }
    await api.post('/customers', form);
    setForm({ name: '', phone: '', email: '', address: '' });
    load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/customers/${id}`);
    load();
  };

  return (
    <div>
      <h2>Customers</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input
          name="phone"
          placeholder="Phone (10 digits)"
          value={form.phone}
          onChange={handlePhoneChange}
          maxLength={10}
        />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <button type="submit">Add Customer</button>
      </form>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>{c.name} — {c.phone} <button onClick={() => handleDelete(c.id)}>Delete</button></li>
        ))}
      </ul>
    </div>
  );
}