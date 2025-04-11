import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue } from 'firebase/database';
import '../styles/ChatBox.css';

const ChatBox = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [sharedFiles, setSharedFiles] = useState([]);

  useEffect(() => {
    const chatRef = ref(db, `chats/${roomId}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data);
        setChatMessages(messages);
      }
    });
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const chatRef = ref(db, `chats/${roomId}`);
    push(chatRef, {
      text: message,
      timestamp: Date.now(),
    });
    setMessage('');
  };

  const handleGoalSet = () => {
    if (!goal.trim()) return;
    const chatRef = ref(db, `chats/${roomId}`);
    push(chatRef, {
      text: `🎯 Goal Set: ${goal}`,
      timestamp: Date.now(),
    });
    setGoal('');
  };

  const handleDeadlineSet = () => {
    if (!deadline) return;
    const chatRef = ref(db, `chats/${roomId}`);
    push(chatRef, {
      text: `⏰ Deadline Set: ${new Date(deadline).toLocaleString()}`,
      timestamp: Date.now(),
    });
    setDeadline('');
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    const chatRef = ref(db, `chats/${roomId}`);
    const fileURL = URL.createObjectURL(uploadedFile);

    push(chatRef, {
      text: `📎 Shared File: `,
      fileName: uploadedFile.name,
      fileURL: fileURL,
      timestamp: Date.now(),
    });

    setSharedFiles([...sharedFiles, uploadedFile.name]);
  };

  return (
    <div className="chatbox-container">
      <h3>Study Room Chat</h3>

      <div className="chat-messages">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            {msg.text}
            {msg.fileURL && (
              <div>
                <a href={msg.fileURL} target="_blank" rel="noopener noreferrer">
                  {msg.fileName}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div className="goal-deadline-section">
        <input
          type="text"
          placeholder="Set your goal..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button onClick={handleGoalSet}>🎯 Set Goal</button>

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button onClick={handleDeadlineSet}>⏰ Set Deadline</button>
      </div>

      <div className="file-upload">
        <input type="file" onChange={handleFileUpload} />
      </div>
    </div>
  );
};

export default ChatBox;
