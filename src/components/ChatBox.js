import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, push, onValue } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import '../styles/ChatBox.css';
  

const ChatBox = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId] = useState(uuidv4()); // 👤 Unique ID
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [countdown, setCountdown] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.values(data).filter(msg => 
          msg.userId === userId || msg.userId === data.userId
        );
        setMessages(loadedMessages);
      }
    });
  }, [roomId, userId]);

  useEffect(() => {
    if (deadline) {
      const interval = setInterval(() => {
        const timeLeft = new Date(deadline) - new Date();
        if (timeLeft <= 0) {
          setCountdown('00:00:00');
          clearInterval(interval);
        } else {
          const hours = String(Math.floor(timeLeft / 3600000)).padStart(2, '0');
          const minutes = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(2, '0');
          const seconds = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0');
          setCountdown(`${hours}:${minutes}:${seconds}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deadline]);

  const sendMessage = () => {
    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    push(messagesRef, {
      text: message,
      timestamp: Date.now(),
      userId,
      goal,
      file: null,
    });
    setMessage('');
  };

  const handleFileUpload = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      push(messagesRef, {
        text: `📁 File shared: ${file.name}`,
        fileName: file.name,
        userId,
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className="chatbox">
      <h3>🧠 Goal: {goal || 'Not set yet'}</h3>
      <h4>⏳ Time Left: {countdown}</h4>
      
      <input
        type="text"
        placeholder="Set a study goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      
      <input
        type="datetime-local"
        onChange={(e) => setDeadline(e.target.value)}
      />

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.userId === userId ? "my-message" : "other-message"}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        
      </div>

      <input
        type="text"
        placeholder="Send a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>

      <input type="file" ref={fileInputRef} />
      <button onClick={handleFileUpload}>Upload & Send File</button>
    </div>
  );
  
};

export default ChatBox;
