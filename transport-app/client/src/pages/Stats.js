import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Stats = () => {
  const { token } = useContext(AuthContext);
  const [monthlyData, setMonthlyData] = useState({});
  const [statusData, setStatusData] = useState({});
  const [routeCounts, setRouteCounts] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/requests/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stats = res.data;
        // Process monthly counts
        const monthMap = {};
        const statusMap = {};
        const routeMap = {};
        stats.forEach((item) => {
          const label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
          monthMap[label] = (monthMap[label] || 0) + item.count;
          statusMap[item._id.status] = (statusMap[item._id.status] || 0) + item.count;
          routeMap[item._id.route] = (routeMap[item._id.route] || 0) + item.count;
        });
        setMonthlyData(monthMap);
        setStatusData(statusMap);
        setRouteCounts(routeMap);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Requests per Month',
        data: Object.values(monthlyData),
        backgroundColor: '#1976d2',
      },
    ],
  };

  const pieStatusData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: ['#1976d2', '#d32f2f', '#2e7d32', '#fbc02d', '#7b1fa2'],
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Statistics</Typography>
      <Box sx={{ maxWidth: 600, marginBottom: 4 }}>
        <Bar data={barData} options={{ plugins: { legend: { display: false }, title: { display: true, text: 'Requests per Month' } } }} />
      </Box>
      <Box sx={{ maxWidth: 400, marginBottom: 4 }}>
        <Pie data={pieStatusData} options={{ plugins: { legend: { position: 'right' }, title: { display: true, text: 'Status Breakdown' } } }} />
      </Box>
      <Box>
        <Typography variant="h6">Top Routes</Typography>
        <ul>
          {Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).map(([route, count]) => (
            <li key={route}>{route}: {count}</li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default Stats;