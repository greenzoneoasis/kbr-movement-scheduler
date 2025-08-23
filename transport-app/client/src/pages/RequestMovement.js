import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const RequestMovement = () => {
  const { token } = useContext(AuthContext);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    date: '',
    time: '',
    route: '',
    notes: '',
  });
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get('/api/teams/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/requests/my', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'pending' },
      });
      setPending(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const member = teamMembers.find((m) => `${m.firstName} ${m.lastName}` === name);
    setFormData((prev) => ({ ...prev, name, position: member ? member.position : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Movement request submitted');
      setFormData({ name: '', position: '', date: '', time: '', route: '', notes: '' });
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to submit';
      toast.error(msg);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Request Movement</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }} required>
          <InputLabel>Name</InputLabel>
          <Select name="name" value={formData.name} label="Name" onChange={handleNameChange}>
            {teamMembers.map((m) => (
              <MenuItem key={m._id} value={`${m.firstName} ${m.lastName}`}>{`${m.firstName} ${m.lastName}`}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          sx={{ width: 200 }}
          required
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          sx={{ width: 200 }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Time"
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          sx={{ width: 200 }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl sx={{ minWidth: 200 }} required>
          <InputLabel>Route</InputLabel>
          <Select name="route" value={formData.route} label="Route" onChange={handleChange}>
            <MenuItem value="BEC → BDSC">BEC → BDSC</MenuItem>
            <MenuItem value="BDSC → BEC">BDSC → BEC</MenuItem>
            <MenuItem value="Union III → BDSC">Union III → BDSC</MenuItem>
            <MenuItem value="BDSC → Union III">BDSC → Union III</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={2}
          sx={{ width: 300 }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'center' }}>Submit</Button>
        <Button component={Link} to="/team/add" variant="outlined" sx={{ alignSelf: 'center' }}>Add Team Member</Button>
      </Box>
      {/* Pending requests */}
      <Typography variant="h6" sx={{ mt: 4 }}>Pending Requests</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Route</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pending.map((r) => (
            <TableRow key={r._id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.position}</TableCell>
              <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
              <TableCell>{r.time}</TableCell>
              <TableCell>{r.route}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RequestMovement;