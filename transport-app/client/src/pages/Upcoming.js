import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Typography } from '@mui/material';

const routeColors = {
  'BEC → BDSC': '#1976d2',
  'BDSC → BEC': '#2e7d32',
  'Union III → BDSC': '#d32f2f',
  'BDSC → Union III': '#ed6c02',
};

const Upcoming = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/requests/upcoming', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = res.data.map((r) => ({
          id: r._id,
          title: r.namePosition,
          start: r.date,
          backgroundColor: routeColors[r.route] || '#2196f3',
          extendedProps: {
            time: r.time,
            route: r.route,
            notes: r.notes,
          },
        }));
        setEvents(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
      </>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Upcoming Schedule</Typography>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        height="auto"
      />
    </Box>
  );
};

export default Upcoming;