import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../styles/HomePage.css';

const HomePage = () => {
  const [createdRooms, setCreatedRooms] = useState([]);
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const navigate = useNavigate();

  const auth = getAuth();
  const firestore = getFirestore();
  const currentUser = auth.currentUser;

  // Step 1: Fetch user interests
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserInterests(userData.interests || []);
        }
      } catch (error) {
        console.error("Error fetching user interests:", error);
      }
    };

    fetchUserInterests();
  }, [currentUser, firestore]);

  // Step 2: Fetch rooms from DB and filter based on interests
  useEffect(() => {
    if (!currentUser || userInterests.length === 0) return;

    const roomRef = ref(db, 'rooms');
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      const allRooms = data ? Object.entries(data).map(([id, room]) => ({ id, ...room })) : [];

      const userRooms = allRooms.filter(room => room.createdBy === currentUser.uid);
      const similarInterestRooms = allRooms.filter(
        room =>
          room.createdBy !== currentUser.uid &&
          room.tags?.some(tag => userInterests.includes(tag))
      );

      setCreatedRooms(userRooms);
      setSuggestedRooms(similarInterestRooms);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [currentUser, userInterests]);

  return (
    <div className="homepage-wrapper">
      <Container>
        <h1 className="text-center mb-5 fw-bold">📚 StudyBuddy</h1>

        {/* Create / Join Room Tiles */}
        <Row className="g-4 justify-content-center mb-5">
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg hover-tile text-center p-3">
              <Card.Body>
                <Card.Title>Create a Study Room</Card.Title>
                <Card.Text>Start a new course and wait for a buddy to join you.</Card.Text>
                <Button variant="warning" onClick={() => navigate('/room/create')}>
                  Create Room
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg hover-tile text-center p-3">
              <Card.Body>
                <Card.Title>Join a Study Room</Card.Title>
                <Card.Text>Explore and join rooms created by others.</Card.Text>
                <Button variant="success" onClick={() => navigate('/room/join')}>
                  Join Room
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* User's Created Rooms */}
        <h4 className="mb-3 text-center">🧠 Your Created Rooms</h4>
        <Row className="g-4 justify-content-center">
          {createdRooms.length > 0 ? (
            createdRooms.map((room) => (
              <Col xs={12} md={6} lg={4} key={room.id}>
                <Card className="created-room-card p-3">
                  <Card.Body>
                    <Card.Title>{room.course}</Card.Title>
                    <Card.Text><strong>Goal:</strong> {room.goal}</Card.Text>
                    <Button variant="outline-dark" onClick={() => navigate(`/room/${room.id}`)}>
                      Enter Room
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} md={6} lg={4}>
              <Card className="p-3 text-center bg-light border-0 shadow-sm">
                <Card.Body>
                  <Card.Title>No Rooms Yet</Card.Title>
                  <Card.Text>You haven’t created any rooms. Start by creating one!</Card.Text>
                  <Button variant="warning" onClick={() => navigate('/room/create')}>Create Now</Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Suggested Rooms by Similar Interests */}
        <h4 className="mb-3 mt-5 text-center">✨ Rooms Matching Your Interests</h4>
        <Row className="g-4 justify-content-center">
          {suggestedRooms.length > 0 ? (
            suggestedRooms.map((room) => (
              <Col xs={12} md={6} lg={4} key={room.id}>
                <Card className="p-3">
                  <Card.Body>
                    <Card.Title>{room.course}</Card.Title>
                    <Card.Text><strong>Goal:</strong> {room.goal}</Card.Text>
                    <Card.Text><strong>Tags:</strong> {room.tags?.join(', ')}</Card.Text>
                    <Button variant="primary" onClick={() => navigate(`/room/${room.id}`)}>
                      Join Room
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} md={6} lg={4}>
              <Card className="p-3 text-center bg-light border-0 shadow-sm">
                <Card.Body>
                  <Card.Title>No Rooms Available</Card.Title>
                  <Card.Text>We couldn’t find any rooms matching your interests right now.</Card.Text>
                  <Button variant="success" onClick={() => navigate('/room/join')}>Browse All Rooms</Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
