import React from 'react';
import AppRoutes from './routes';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
};

export default App;
