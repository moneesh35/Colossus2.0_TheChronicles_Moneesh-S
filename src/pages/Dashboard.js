// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get, update } from 'firebase/database';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newInterests, setNewInterests] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // If user not found in localStorage, redirect to login
    if (!user || !user.id) {
      alert("User not found. Please login again.");
      navigate('/'); // or '/login' if you have a separate login route
      return;
    }

    const fetchData = async () => {
      const userRef = ref(db, `users/${user.id}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setData(snapshot.val());
        setNewInterests(snapshot.val().interests || '');
      }
    };
    fetchData();
  }, [navigate, user]);

  const handleSave = async () => {
    const userRef = ref(db, `users/${user.id}`);
    await update(userRef, { interests: newInterests });
    setEditing(false);
    alert('✅ Interests updated!');
  };

  return (
    <div className="dashboard">
      <h2>👤 Your Dashboard</h2>
      {data ? (
        <div>
          <p><strong>Name:</strong> {data.name}</p>
          <p>
            <strong>Interests:</strong>{' '}
            {editing ? (
              <>
                <input value={newInterests} onChange={(e) => setNewInterests(e.target.value)} />
                <button onClick={handleSave}>💾 Save</button>
              </>
            ) : (
              <>
                {data.interests}
                <button onClick={() => setEditing(true)}>✏️ Edit</button>
              </>
            )}
          </p>
          <p><strong>Points:</strong> 🪙 {data.points || 0}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
