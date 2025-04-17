import React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import ChatIcon from '@mui/icons-material/Chat';

const Navbar: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Momie
          </Typography>
          <IconButton
            size="large"
            aria-label="chat"
            color="inherit"
          >
            <ChatIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="login account"
            color="inherit"
          >
            <LoginIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;