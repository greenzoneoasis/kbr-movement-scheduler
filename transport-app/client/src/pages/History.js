import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const History = () => {
  const { token, user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ status: '', route: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/requests/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filtered = history.filter((r) => {
    const date = new Date(r.date);
    const { status, route, startDate, endDate } = filters;
    if (status && r.status !== status) return false;
    if (route && r.route !== route) return false;
    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate)) return false;
    return true;
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>History</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Route</InputLabel>
          <Select name="route" value={filters.route} label="Route" onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="BEC → BDSC">BEC → BDSC</MenuItem>
            <MenuItem value="BDSC → BEC">BDSC → BEC</MenuItem>
            <MenuItem value="Union III → BDSC">Union III → BDSC</MenuItem>
            <MenuItem value="BDSC → Union III">BDSC → Union III</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="From"
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Requested By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r._id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.position}</TableCell>
              <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
              <TableCell>{r.time}</TableCell>
              <TableCell>{r.route}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.user?.lastName || (user.role === 'client' ? '' : '')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default History;