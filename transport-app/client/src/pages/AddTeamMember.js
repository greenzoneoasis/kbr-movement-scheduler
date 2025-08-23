import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddTeamMember = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [passport, setPassport] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teams', { firstName, lastName, position, passport }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Team member added');
      navigate('/team');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to add team member';
      toast.error(msg);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Add Team Member</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          label="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
        <TextField
          label="Passport#"
          value={passport}
          onChange={(e) => setPassport(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">Save</Button>
      </Box>
    </Box>
  );
};

export default AddTeamMember;