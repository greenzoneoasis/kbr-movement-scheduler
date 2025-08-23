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

const Users = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePassword = async (id) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      await axios.put(`/api/users/${id}/password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Password updated');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to update password';
      toast.error(msg);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to delete user';
      toast.error(msg);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Users</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, index) => (
            <TableRow key={u._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{`${u.firstName || ''} ${u.lastName || ''}`}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => changePassword(u._id)}>Change Password</Button>
                <Button size="small" variant="outlined" color="error" onClick={() => deleteUser(u._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Users;