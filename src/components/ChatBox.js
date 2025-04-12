// src/components/ChatBox.js
import '../styles/ChatBox.css';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const ChatBox = ({ roomId, onGoalSet, onDeadlineSet, onCourseSet }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [course, setCourse] = useState('');
  const [sharedFiles, setSharedFiles] = useState([]);

  useEffect(() => {
    const chatRef = ref(db, `chats/${roomId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data);
        setChatMessages(messages);

        // Sync states back to parent if user refreshes
        messages.forEach((msg) => {
          if (msg.text?.startsWith('🎯 Goal Set:') && onGoalSet) {
            onGoalSet(msg.text.replace('🎯 Goal Set: ', ''));
          } else if (msg.text?.startsWith('⏰ Deadline Set:') && onDeadlineSet) {
            const match = msg.text.match(/⏰ Deadline Set: (.*)/);
            if (match) {
              const time = new Date(match[1]).toISOString();
              onDeadlineSet(time);
            }
          } else if (msg.text?.startsWith('📘 Course Set:') && onCourseSet) {
            onCourseSet(msg.text.replace('📘 Course Set: ', ''));
          }
        });

      } else {
        setChatMessages([]);
      }
    });

    return () => unsubscribe();
  }, [roomId, onGoalSet, onDeadlineSet, onCourseSet]);

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
    const goalText = `🎯 Goal Set: ${goal}`;
    push(chatRef, { text: goalText, timestamp: Date.now() });
    if (onGoalSet) onGoalSet(goal);
    setGoal('');
  };

  const handleDeadlineSet = () => {
    if (!deadline) return;
    const chatRef = ref(db, `chats/${roomId}`);
    const formatted = new Date(deadline).toLocaleString();
    push(chatRef, { text: `⏰ Deadline Set: ${formatted}`, timestamp: Date.now() });
    if (onDeadlineSet) onDeadlineSet(deadline);
    setDeadline('');
  };

  const handleCourseSet = () => {
    if (!course.trim()) return;
    const chatRef = ref(db, `chats/${roomId}`);
    const courseText = `📘 Course Set: ${course}`;
    push(chatRef, { text: courseText, timestamp: Date.now() });
    if (onCourseSet) onCourseSet(course);
    setCourse('');
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    const fileURL = URL.createObjectURL(uploadedFile);
    const chatRef = ref(db, `chats/${roomId}`);
    push(chatRef, {
      text: `📎 Shared File: `,
      fileName: uploadedFile.name,
      fileURL,
      timestamp: Date.now(),
    });
    setSharedFiles([...sharedFiles, uploadedFile.name]);
  };

  const handleClearChat = async () => {
    const chatRef = ref(db, `chats/${roomId}`);
    await remove(chatRef);
    setChatMessages([]);
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
        <button
          onClick={handleClearChat}
          style={{ marginLeft: '10px', backgroundColor: '#f44336', color: 'white' }}
        >
          Clear Chat
        </button>
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

      <div className="course-section">
        <input
          type="text"
          placeholder="Set your course..."
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <button onClick={handleCourseSet}>📘 Set Course</button>
      </div>

      <div className="file-upload">
  <input 
    type="file" 
    id="file-upload" 
    style={{ display: 'none' }} 
    onChange={handleFileUpload} 
  />
  <label htmlFor="file-upload" className="upload-btn">
    📎 Choose File to Share
  </label>
  {sharedFiles.length > 0 && (
    <p className="file-name">Last Uploaded: {sharedFiles[sharedFiles.length - 1]}</p>
  )}
</div>

    </div>
  );
};

export default ChatBox;
