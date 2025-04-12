import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const firestore = getFirestore();
  const [currentUser, setCurrentUser] = useState(null);

  const [userInterests, setUserInterests] = useState([]);
  const [userSubjects, setUserSubjects] = useState([]);
  const [createdRooms, setCreatedRooms] = useState([]);
  const [suggestedRooms, setSuggestedRooms] = useState([]);

  const dummyRooms = [
    {
      id: 'dummy1',
      course: 'Web Dev Bootcamp',
      goal: 'Master React in 10 days',
      tags: ['react', 'frontend']
    },
    {
      id: 'dummy2',
      course: 'Cybersecurity Crash Course',
      goal: 'Understand SIEM & Threats',
      tags: ['cybersecurity', 'security']
    },
    {
      id: 'dummy3',
      course: 'Data Science Basics',
      goal: 'Learn Python and Pandas',
      tags: ['python', 'data']
    }
  ];

  // 1. Get current user from auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // 2. Fetch user interests and subjects from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(firestore, 'users', currentUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserInterests(data.interests || []);
          setUserSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [currentUser, firestore]);

  // 3. Fetch rooms from Realtime DB
  useEffect(() => {
    if (!currentUser) return;

    const roomRef = ref(db, 'rooms');
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCreatedRooms([]);
        setSuggestedRooms([]);
        return;
      }

      const roomsArray = Object.entries(data).map(([id, room]) => ({
        id,
        ...room
      }));

      const yourRooms = roomsArray.filter(room => room.createdBy === currentUser.uid);

      const matchingRooms = roomsArray.filter(
        room =>
          room.createdBy !== currentUser.uid &&
          (
            room.tags?.some(tag => userInterests.includes(tag)) ||
            room.subjects?.some(sub => userSubjects.includes(sub))
          )
      );

      setCreatedRooms(yourRooms);
      setSuggestedRooms(matchingRooms);
    });

    return () => unsubscribe();
  }, [currentUser, userInterests, userSubjects]);

  return (
    <div className="homepage-wrapper" style={{ background: 'linear-gradient(to bottom, #ffe4b5, #fff3e0)' }}>
      <Container>
        <h1 className="text-center fw-bold mt-4 mb-2">📚 StudyBuddy</h1>
        <p className="text-center fs-5 text-muted mb-5">Connect. Collaborate. Conquer Your Study Goals Together.</p>

        {/* Create / Join Tiles */}
        <Row className="g-4 justify-content-center mb-5">
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg hover-tile text-center p-3">
              <Card.Body>
                <Card.Title>Create a Study Room</Card.Title>
                <Card.Text>Start a new course and wait for a buddy to join.</Card.Text>
                <Button variant="warning" onClick={() => navigate('/create-room')}>Create Room</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg hover-tile text-center p-3">
              <Card.Body>
                <Card.Title>Join a Study Room</Card.Title>
                <Card.Text>Explore and join rooms created by others.</Card.Text>
                <Button variant="success" onClick={() => navigate('/room/join')}>Join Room</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Created Rooms */}
        <h4 className="mb-3 mt-5 text-center">🧠 Your Created Rooms</h4>
        <Row className="g-4 justify-content-center">
          {(createdRooms.length > 0 ? createdRooms : dummyRooms).map(room => (
            <Col xs={12} md={6} lg={4} key={room.id}>
              <Card className="created-room-card p-3">
                <Card.Body>
                  <Card.Title>{room.course}</Card.Title>
                  <Card.Text><strong>Goal:</strong> {room.goal}</Card.Text>
                  <Card.Text><strong>Tags:</strong> {room.tags?.join(', ')}</Card.Text>
                  <Button variant="outline-dark" onClick={() => navigate(`/room/${room.id}`)}>Enter Room</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Suggested Rooms */}
        <h4 className="mb-3 mt-5 text-center">✨ Rooms Matching Your Interests</h4>
        <Row className="g-4 justify-content-center">
          {(suggestedRooms.length > 0 ? suggestedRooms : dummyRooms).map(room => (
            <Col xs={12} md={6} lg={4} key={room.id}>
              <Card className="p-3">
                <Card.Body>
                  <Card.Title>{room.course}</Card.Title>
                  <Card.Text><strong>Goal:</strong> {room.goal}</Card.Text>
                  <Card.Text><strong>Tags:</strong> {room.tags?.join(', ')}</Card.Text>
                  <Button variant="primary" onClick={() => navigate(`/room/${room.id}`)}>Join Room</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
