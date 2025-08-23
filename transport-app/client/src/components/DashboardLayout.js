import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const drawerWidth = 240;

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const menuItems = [];
  if (user) {
    // Common pages
    menuItems.push({ label: 'Upcoming', path: '/upcoming' });
    menuItems.push({ label: 'History', path: '/history' });
    // Client-only pages
    if (user.role === 'client') {
      menuItems.push({ label: 'Request Movement', path: '/request' });
      menuItems.push({ label: 'Team Members', path: '/team' });
    }
    // Admin-only pages
    if (user.role === 'admin') {
      menuItems.push({ label: 'Review Requests', path: '/review' });
      menuItems.push({ label: 'Users', path: '/users' });
      menuItems.push({ label: 'Stats', path: '/stats' });
    }
  }
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Transport App
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Main content */}
      <div style={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Welcome {user && user.role.toUpperCase()}</Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Toolbar>
        </AppBar>
        <div style={{ padding: 16 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;