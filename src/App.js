import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import MatchPage from './pages/MatchPage';
import HomePage from './pages/HomePage';
import CreateRoom from './pages/CreateRoom';
import RoomPage from './pages/RoomPage';
import FeedbackPage from './pages/FeedbackPage';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/create-room" element={<CreateRoom />} />
      <Route path="/room/:id" element={<RoomPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/feedback/:roomId" element={<FeedbackPage />} />
      <Route path="/dashboard" element={<Dashboard />} />


    </Routes>
  );
}


export default App;
