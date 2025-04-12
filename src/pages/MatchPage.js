import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { ref, set, get, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const MatchPage = () => {
  const [tags, setTags] = useState('');
  const [matchFound, setMatchFound] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    const userRef = ref(db, `users/${currentUser.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.tags) setTags(userData.tags.join(', '));
      }
    });

    const allUsersRef = ref(db, 'users');
    onValue(allUsersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = [];
      for (const uid in data) {
        if (uid !== currentUser.uid) {
          userList.push({ uid, ...data[uid] });
        }
      }
      setAllUsers(userList);
    });
  }, [currentUser]);

  const saveTags = async () => {
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    const userRef = ref(db, `users/${currentUser.uid}`);
    await set(userRef, {
      email: currentUser.email,
      tags: tagArray,
    });
    alert('Tags saved!');
  };

  const findMatch = () => {
    const userTags = tags.split(',').map(tag => tag.trim().toLowerCase());

    const matchedUser = allUsers.find((user) =>
      user.tags && user.tags.some(tag => userTags.includes(tag))
    );

    if (matchedUser) {
      const roomId = [currentUser.uid, matchedUser.uid].sort().join('-');
      setMatchFound(matchedUser);
      navigate(`/room/${roomId}`);
    } else {
      alert('No match found with similar tags!');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Match with a Study Buddy</h2>

      <label>Enter your tags (comma-separated):</label>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. React, Python, AI"
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button onClick={saveTags}>Save Tags</button>
      <button onClick={findMatch} style={{ marginLeft: '10px' }}>Find Match</button>

      {matchFound && (
        <div style={{ marginTop: '1rem' }}>
          <p>Matched with: <strong>{matchFound.email}</strong></p>
        </div>
      )}
    </div>
  );
};

export default MatchPage;
