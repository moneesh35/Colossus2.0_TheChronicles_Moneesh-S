// src/pages/RoomPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import { db } from '../firebase';
import { ref, remove, push, set } from 'firebase/database';
import '../styles/RoomPage.css';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [course, setCourse] = useState('');
  const [countdown, setCountdown] = useState('');

  // ✅ Track user join and leave in chat
  useEffect(() => {
    if (!currentUser) return;

    const userRef = ref(db, `rooms/${roomId}/participants/${currentUser.id}`);
    const chatRef = ref(db, `chats/${roomId}`);

    // Set user in participants list
    set(userRef, { name: currentUser.name });

    // Push join message
    push(chatRef, {
      text: `✅ ${currentUser.name} has joined the room.`,
      timestamp: Date.now(),
    });

    // On leave
    return () => {
      remove(userRef);
      push(chatRef, {
        text: `👋 ${currentUser.name} has left the room.`,
        timestamp: Date.now(),
      });
    };
  }, [roomId, currentUser]);

  // ⏳ Countdown Timer + Auto-close
  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(interval);
        setCountdown('⏳ Deadline Reached');

        // Notify and delete room after delay
        const chatRef = ref(db, `chats/${roomId}`);
        push(chatRef, {
          text: '⚠️ Deadline reached. This room is now closed.',
          timestamp: Date.now(),
        });

        setTimeout(async () => {
          await remove(ref(db, `rooms/${roomId}`));
          await remove(chatRef);
          navigate('/');
        }, 5000);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, roomId, navigate]);

  // 📎 Copy room link
  const handleCopyLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('📎 Room link copied to clipboard!');
  };

// 👋 Leave room and go to feedback
const handleLeaveRoom = async () => {
  const chatRef = ref(db, `chats/${roomId}`);
  
  if (currentUser && currentUser.name) {
    await push(chatRef, {
      text: `👋 ${currentUser.name} has left the room.`,
      timestamp: Date.now(),
    });
  } else {
    await push(chatRef, {
      text: `👤 A participant has left the room.`,
      timestamp: Date.now(),
    });
  }

  navigate(`/feedback/${roomId}`);
};


  return (
    <div className="room-page-wrapper">
      <div className="room-page-container">
        <h2>Welcome to Room: {roomId}</h2>

        <div className="room-actions">
          <button onClick={handleCopyLink} className="room-btn">📎 Copy Room Link</button>
          <button onClick={handleLeaveRoom} className="room-btn leave">👋 Leave Room</button>
        </div>

        <div className="room-details">
          <p><strong>📘 Course:</strong> {course || 'Not set yet'}</p>
          <p><strong>🎯 Goal:</strong> {goal || 'Not set yet'}</p>
          <p><strong>⏰ Deadline:</strong> {deadline ? new Date(deadline).toLocaleString() : 'Not set yet'}</p>
          {deadline && <p><strong>⏳ Time Left:</strong> {countdown}</p>}
        </div>

        <ChatBox
          roomId={roomId}
          onGoalSet={setGoal}
          onDeadlineSet={setDeadline}
          onCourseSet={setCourse}
        />
      </div>
    </div>
  );
};

export default RoomPage;
