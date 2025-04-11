import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const mockCourses = [
  { id: 1, subject: 'Math', creator: 'Alice' },
  { id: 2, subject: 'Physics', creator: 'Bob' },
  { id: 3, subject: 'Biology', creator: 'Charlie' },
  { id: 4, subject: 'Chemistry', creator: 'Dave' },
];

const HomePage = () => {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const filteredCourses = mockCourses.filter(course =>
    course.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fffacd, #ffffff)',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <Container>
        <h1 className="text-center mb-5 fw-bold animate__animated animate__fadeInDown">📚 StudyBuddy</h1>

        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={6}>
            <Form.Control
              type="text"
              placeholder="🔍 Filter by Subject"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="shadow-sm"
            />
          </Col>
        </Row>

        <Row className="g-4 justify-content-center mb-5">
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg hover-tile text-center p-3">
              <Card.Body>
                <Card.Title>Create a Study Room</Card.Title>
                <Card.Text>Start a new course and wait for a buddy to join you.</Card.Text>
                <Button variant="warning" onClick={() => navigate('/room/create')}>Create Room</Button>
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

        <Row>
          <h4 className="mb-3 text-center">🎓 Available Courses</h4>
          {filteredCourses.map(course => (
            <Col xs={12} md={6} lg={4} key={course.id} className="mb-4">
              <Card className="shadow-sm p-3 hover-tile">
                <Card.Body>
                  <Card.Title>{course.subject}</Card.Title>
                  <Card.Text>Created by: {course.creator}</Card.Text>
                  <Button variant="outline-primary" onClick={() => navigate('/room/join')}>Join</Button>
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
