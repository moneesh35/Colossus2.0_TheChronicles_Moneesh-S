// src/pages/FeedbackPage.js

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/FeedbackPage.css';
import { ref, set, get, update } from 'firebase/database';
import { db } from '../firebase';

const FeedbackPage = () => {
  const { roomId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('User not found. Please login again.');
        return;
      }

      // Save feedback
      const feedbackRef = ref(db, `feedbacks/${user.id}/${roomId}`);
      await set(feedbackRef, {
        stars: rating,
        timestamp: Date.now(),
      });

      // Update user points
      const userRef = ref(db, `users/${user.id}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const existingPoints = snapshot.val().points || 0;
        await update(userRef, { points: existingPoints + rating });
      }

      alert(`✅ You rated ${rating} star(s)! Redirecting to your dashboard...`);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert('Something went wrong while submitting feedback.');
    }
  };

  return (
    <div className="feedback-wrapper">
      <h2>🌟 Rate Your Study Buddy</h2>
      <p>Room ID: <strong>{roomId}</strong></p>

      <div className="stars">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              className={`star ${starValue <= (hover || rating) ? 'on' : 'off'}`}
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(rating)}
            >
              ★
            </button>
          );
        })}
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={rating === 0}>
        Submit Feedback
      </button>
    </div>  
  );
};

export default FeedbackPage;
