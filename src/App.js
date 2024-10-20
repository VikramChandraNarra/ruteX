// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './MapComponent';
import Home from './Home';
import Chatbot from './Chatbot';
import NavBar from './NavBar';
import { Box, Flex } from '@chakra-ui/react';
import SpeechToText from './SpeechToText';
import Voice from './Voice';
import Loading from './Loading';

function App() {
  return (
    <Router>
      <Flex height="100vh" overflow="hidden">
        {/* Navbar on the left */}
        <NavBar />

        {/* Content area shifted to the right */}
        <Box flex="1" ml="80px" overflowY="auto">
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />

            {/* Chat Route */}
            <Route path="/chat" element={<Chatbot />} />

            {/* Map Route */}
            <Route path="/map" element={<Map />} />
            
            {/* Speech and Voice Routes */}
            <Route path="/voice" element={<Voice />} />

            {/* Loading Route */}
            <Route path="/loading" element={<Loading />} />
          </Routes>
        </Box>
      </Flex>
    </Router>
  );
}

export default App;
