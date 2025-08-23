import React, { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import RequestMovement from './pages/RequestMovement';
import TeamMembers from './pages/TeamMembers';
import AddTeamMember from './pages/AddTeamMember';
import AdminReview from './pages/AdminReview';
import Upcoming from './pages/Upcoming';
import History from './pages/History';
import Users from './pages/Users';
import Stats from './pages/Stats';

const App = () => {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Protected routes */}
      <Route path="/*" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="upcoming" />} />
        <Route path="request" element={<RequestMovement />} />
        <Route path="team" element={<TeamMembers />} />
        <Route path="team/add" element={<AddTeamMember />} />
        <Route path="review" element={<AdminReview />} />
        <Route path="upcoming" element={<Upcoming />} />
        <Route path="history" element={<History />} />
        <Route path="users" element={<Users />} />
        <Route path="stats" element={<Stats />} />
      </Route>
    </Routes>
  );
};

export default App;