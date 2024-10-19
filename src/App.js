// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './MapComponent';
import Home from './Home';
import Chatbot from './Chatbot';
import NavBar from './NavBar';
import { Box } from '@chakra-ui/react';
import SpeechToText from './SpeechToText';
import Voice from './Voice';


function App() {
  return (
    <Router>
      <NavBar />
      <Box p={4}>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />

          {/* Chat Route */}
          <Route path="/chat" element={<Chatbot />} />

          {/* Map Route */}
          <Route path="/map" element={<Map />} />
          <Route path="/speech" element={<SpeechToText />} />
          <Route path="/voice" element={<Voice />} />

        </Routes>
      </Box>
    </Router>
  );
}

export default App;
