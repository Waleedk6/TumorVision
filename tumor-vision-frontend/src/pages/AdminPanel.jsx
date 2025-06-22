// AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import './styles.css';

const AdminPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', specialty: '', availability: '' });

  const fetchDoctors = async () => {
    const res = await fetch('http://localhost:5000/api/doctors');
    const data = await res.json();
    setDoctors(data);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchDoctors();
      setForm({ name: '', email: '', specialty: '', availability: '' });
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => { fetchDoctors(); }, []);

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <form className="add-doctor-form" onSubmit={handleAddDoctor}>
        <input name="name" placeholder="Doctor Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
        <input name="specialty" placeholder="Specialty" value={form.specialty} onChange={handleChange} required />
        <input name="availability" placeholder="Availability (e.g. Mon-Fri 10am-2pm)" value={form.availability} onChange={handleChange} required />
        <button type="submit">Add Doctor</button>
      </form>

      <h3>Registered Doctors</h3>
      <ul className="doctor-list">
        {doctors.map(doc => (
          <li key={doc._id}>{doc.name} - {doc.specialty} ({doc.availability})</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
