import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminReview = () => {
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/requests/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPending(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    try {
      await axios.put(`/api/requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Approved');
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Action failed';
      toast.error(msg);
    }
  };

  const decline = async (id) => {
    const reason = prompt('Reason for decline:');
    try {
      await axios.put(`/api/requests/${id}/decline`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Declined');
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Action failed';
      toast.error(msg);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Pending Requests</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Requested By</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Actions</TableCell>
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
              <TableCell>{r.user?.lastName}</TableCell>
              <TableCell>{r.notes}</TableCell>
              <TableCell>
                <Button onClick={() => approve(r._id)} size="small" variant="contained" color="success" sx={{ mr: 1 }}>Approve</Button>
                <Button onClick={() => decline(r._id)} size="small" variant="contained" color="error">Decline</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdminReview;