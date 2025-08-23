import React, { useContext, useEffect, useState } from 'react';
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
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const TeamMembers = () => {
  const { token, user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const url = user.role === 'admin' ? '/api/teams' : '/api/teams/my';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Team Members</Typography>
      <Button component={Link} to="/team/add" variant="contained" color="primary" sx={{ mb: 2 }}>Add Team Member</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Passport</TableCell>
            {user.role === 'admin' && <TableCell>Requested By</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m, index) => (
            <TableRow key={m._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{`${m.lastName}, ${m.firstName}`}</TableCell>
              <TableCell>{m.position}</TableCell>
              <TableCell>{m.passport}</TableCell>
              {user.role === 'admin' && <TableCell>{m.createdBy?.lastName || ''}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default TeamMembers;