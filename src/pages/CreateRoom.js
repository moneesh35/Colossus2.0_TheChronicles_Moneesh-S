// src/pages/CreateRoom.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleCreateRoom = () => {
    if (!roomName || !course) {
      setError('Please fill in all fields');
      return;
    }

    const roomId = uuidv4(); // Generate unique Room ID
    const newRoom = {
      roomName,
      course,
      createdBy: currentUser.uid,
      tags: [], // Add tags logic as per your need
      subjects: [], // Add subjects logic as per your need
    };

    // Save room to Firebase
    const roomRef = ref(db, 'rooms');
    push(roomRef, newRoom)
      .then(() => {
        navigate(`/room/${roomId}`);
      })
      .catch((err) => {
        setError('Failed to create room. Please try again.');
        console.error('Error creating room:', err);
      });
  };

  return (
    <Container>
      <h2 className="text-center mt-4">Create a New Room</h2>
      <Form className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Room Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleCreateRoom}>
          Create Room
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRoom;
